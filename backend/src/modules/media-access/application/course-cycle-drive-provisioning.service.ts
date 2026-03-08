import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { GoogleAuth } from 'google-auth-library';
import { WorkspaceGroupsService } from '@modules/media-access/application/workspace-groups.service';
import { DriveScopeProvisioningService } from '@modules/media-access/application/drive-scope-provisioning.service';
import {
  MEDIA_ACCESS_DRIVE_FOLDERS,
  MEDIA_ACCESS_STAFF_GROUP_METADATA,
} from '@modules/media-access/domain/media-access.constants';
import { technicalSettings } from '@config/technical-settings';

type GoogleRequestMethod = 'GET' | 'POST';
type GoogleRequest = {
  url: string;
  method: GoogleRequestMethod;
  data?: unknown;
  headers?: Record<string, string>;
};
type GoogleResponse<T> = { data: T };
interface GoogleRequestClient {
  request<T = unknown>(request: GoogleRequest): Promise<GoogleResponse<T>>;
}

type DriveFileListResponse = {
  files?: Array<{ id: string }>;
};
type DriveCreateResponse = {
  id?: string;
};

type EmailRow = {
  email: string | null;
};

type CourseCycleDriveProvisionInput = {
  courseCycleId: string;
  cycleCode: string;
  courseCode: string;
  bankCards: Array<{ evaluationTypeCode: string; number: number }>;
};

type CourseCycleDriveProvisionResult = {
  scopeFolderId: string;
  introFolderId: string;
  bankFolderId: string;
  viewerGroupEmail: string;
  bankLeafFoldersCreated: number;
};

const BANK_TYPE_FOLDER_LABELS: Record<string, string> = {
  PC: 'Prácticas Calificadas',
  PD: 'Prácticas Dirigidas',
  EX: 'Exámenes',
  LAB: 'Laboratorios',
  TUTORING: 'Tutorías Especializadas',
};

@Injectable()
export class CourseCycleDriveProvisioningService {
  constructor(
    private readonly configService: ConfigService,
    @InjectDataSource()
    private readonly dataSource: DataSource,
    private readonly workspaceGroupsService: WorkspaceGroupsService,
    private readonly driveScopeProvisioningService: DriveScopeProvisioningService,
  ) {}

  async provision(
    input: CourseCycleDriveProvisionInput,
  ): Promise<CourseCycleDriveProvisionResult> {
    const workspaceDomain = this.getWorkspaceGroupDomain();
    const courseCycleId = this.normalizeNumericId(
      input.courseCycleId,
      'courseCycleId',
    );
    const cycleCode = this.normalizeToken(input.cycleCode, 'cycleCode');
    const courseCode = this.normalizeToken(input.courseCode, 'courseCode');
    const viewerGroupEmail = `cc-${courseCycleId}-viewers@${workspaceDomain}`;

    const driveClient = await this.getDriveClient();
    const rootFolderId = this.getDriveRootFolderId();

    const courseCyclesParent = await this.findOrCreateFolderUnderParent(
      driveClient,
      rootFolderId,
      MEDIA_ACCESS_DRIVE_FOLDERS.COURSE_CYCLES_PARENT,
    );
    const cycleFolderId = await this.findOrCreateFolderUnderParent(
      driveClient,
      courseCyclesParent,
      cycleCode,
    );
    const scopeFolderId = await this.findOrCreateFolderUnderParent(
      driveClient,
      cycleFolderId,
      `cc_${courseCycleId}_${courseCode}`,
    );
    const introFolderId = await this.findOrCreateFolderUnderParent(
      driveClient,
      scopeFolderId,
      MEDIA_ACCESS_DRIVE_FOLDERS.COURSE_CYCLE_INTRO_VIDEO,
    );
    const bankFolderId = await this.findOrCreateFolderUnderParent(
      driveClient,
      scopeFolderId,
      'bank_documents',
    );

    const group = await this.workspaceGroupsService.findOrCreateGroup({
      email: viewerGroupEmail,
      name: `CC ${courseCycleId} Viewers`,
      description: `Acceso viewer para contenido de course_cycle ${courseCycleId}`,
    });

    await this.driveScopeProvisioningService.ensureGroupReaderPermission(
      scopeFolderId,
      group.email,
    );

    const configuredStaffGroupEmail = this.getConfiguredStaffGroupEmail();
    if (configuredStaffGroupEmail) {
      const staffGroup = await this.workspaceGroupsService.findOrCreateGroup({
        email: configuredStaffGroupEmail,
        name: MEDIA_ACCESS_STAFF_GROUP_METADATA.NAME,
        description: MEDIA_ACCESS_STAFF_GROUP_METADATA.DESCRIPTION,
      });
      await this.driveScopeProvisioningService.ensureGroupReaderPermission(
        scopeFolderId,
        staffGroup.email,
      );
    }

    let bankLeafFoldersCreated = 0;
    const grouped = this.groupBankCardsByType(input.bankCards);
    for (const [evaluationTypeCode, numbers] of grouped.entries()) {
      const typeFolderLabel =
        BANK_TYPE_FOLDER_LABELS[evaluationTypeCode] || evaluationTypeCode;
      const typeFolderId = await this.findOrCreateFolderUnderParent(
        driveClient,
        bankFolderId,
        typeFolderLabel,
      );

      for (const number of numbers) {
        await this.findOrCreateFolderUnderParent(
          driveClient,
          typeFolderId,
          `${evaluationTypeCode}${number}`,
        );
        bankLeafFoldersCreated += 1;
      }
    }

    await this.syncCurrentEligibleMembers(group.email, courseCycleId);

    return {
      scopeFolderId,
      introFolderId,
      bankFolderId,
      viewerGroupEmail: group.email,
      bankLeafFoldersCreated,
    };
  }

  private async syncCurrentEligibleMembers(
    groupEmail: string,
    courseCycleId: string,
  ): Promise<void> {
    const rows = await this.dataSource.query<EmailRow[]>(
      `
        SELECT DISTINCT LOWER(TRIM(source.email)) AS email
        FROM (
          SELECT u.email
          FROM enrollment e
          INNER JOIN user u ON u.id = e.user_id
          WHERE e.course_cycle_id = ?
            AND e.cancelled_at IS NULL
            AND u.is_active = 1

          UNION ALL

          SELECT u.email
          FROM course_cycle_professor ccp
          INNER JOIN user u ON u.id = ccp.professor_user_id
          WHERE ccp.course_cycle_id = ?
            AND ccp.revoked_at IS NULL
            AND u.is_active = 1
        ) source
        WHERE source.email IS NOT NULL
          AND TRIM(source.email) <> ''
      `,
      [courseCycleId, courseCycleId],
    );

    for (const row of rows) {
      const email = String(row.email || '')
        .trim()
        .toLowerCase();
      if (!email) {
        continue;
      }
      await this.workspaceGroupsService.ensureMemberInGroup({
        groupEmail,
        memberEmail: email,
      });
    }
  }

  private groupBankCardsByType(
    cards: Array<{ evaluationTypeCode: string; number: number }>,
  ): Map<string, number[]> {
    const grouped = new Map<string, Set<number>>();
    for (const card of cards) {
      const code = this.normalizeToken(
        String(card.evaluationTypeCode || '').toUpperCase(),
        'evaluationTypeCode',
      );
      const number = this.normalizePositiveInt(card.number, 'number');
      const set = grouped.get(code) || new Set<number>();
      set.add(number);
      grouped.set(code, set);
    }

    const normalized = new Map<string, number[]>();
    for (const [code, numbers] of grouped.entries()) {
      normalized.set(
        code,
        Array.from(numbers.values()).sort((a, b) => a - b),
      );
    }
    return normalized;
  }

  private async getDriveClient(): Promise<GoogleRequestClient> {
    const keyFile = String(
      this.configService.get<string>('GOOGLE_APPLICATION_CREDENTIALS', '') ||
        '',
    ).trim();
    if (!keyFile) {
      throw new InternalServerErrorException(
        'Falta GOOGLE_APPLICATION_CREDENTIALS en configuracion',
      );
    }
    const auth = new GoogleAuth({
      keyFile,
      scopes: ['https://www.googleapis.com/auth/drive'],
    });
    const client = (await auth.getClient()) as unknown as GoogleRequestClient;
    if (typeof client.request !== 'function') {
      throw new InternalServerErrorException(
        'Cliente de Google Drive invalido',
      );
    }
    return client;
  }

  private getDriveRootFolderId(): string {
    const rootFolderId = String(
      this.configService.get<string>('GOOGLE_DRIVE_ROOT_FOLDER_ID', '') || '',
    ).trim();
    if (!rootFolderId) {
      throw new InternalServerErrorException(
        'Falta GOOGLE_DRIVE_ROOT_FOLDER_ID en configuracion',
      );
    }
    return rootFolderId;
  }

  private async findOrCreateFolderUnderParent(
    client: GoogleRequestClient,
    parentFolderId: string,
    folderName: string,
  ): Promise<string> {
    const query = `'${parentFolderId}' in parents and name='${folderName}' and mimeType='application/vnd.google-apps.folder' and trashed=false`;
    const listResponse = await client.request<DriveFileListResponse>({
      url: `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&fields=files(id)&pageSize=2&supportsAllDrives=true&includeItemsFromAllDrives=true`,
      method: 'GET',
    });
    const files = listResponse.data.files || [];
    if (files.length === 1) {
      return files[0].id;
    }
    if (files.length > 1) {
      throw new InternalServerErrorException(
        `Nombre ambiguo de carpeta bajo el mismo padre: ${folderName}`,
      );
    }

    const createResponse = await client.request<DriveCreateResponse>({
      url: 'https://www.googleapis.com/drive/v3/files?supportsAllDrives=true',
      method: 'POST',
      data: {
        name: folderName,
        mimeType: 'application/vnd.google-apps.folder',
        parents: [parentFolderId],
      },
      headers: {
        'Content-Type': 'application/json',
      },
    });
    const id = String(createResponse.data.id || '').trim();
    if (!id) {
      throw new InternalServerErrorException(
        `Google Drive no devolvio id para carpeta ${folderName}`,
      );
    }
    return id;
  }

  private normalizeToken(raw: string, fieldName: string): string {
    const normalized = String(raw || '').trim();
    if (!normalized) {
      throw new InternalServerErrorException(`${fieldName} vacio`);
    }
    return normalized.replace(/[^A-Za-z0-9_-]/g, '-').replace(/-+/g, '-');
  }

  private normalizeNumericId(raw: string, fieldName: string): string {
    const normalized = String(raw || '').trim();
    if (!/^\d+$/.test(normalized)) {
      throw new InternalServerErrorException(`${fieldName} invalido`);
    }
    return normalized;
  }

  private normalizePositiveInt(value: number, fieldName: string): number {
    if (!Number.isInteger(value) || value <= 0) {
      throw new InternalServerErrorException(`${fieldName} invalido`);
    }
    return value;
  }

  private getWorkspaceGroupDomain(): string {
    const domain = String(
      this.configService.get<string>('GOOGLE_WORKSPACE_GROUP_DOMAIN', '') || '',
    )
      .trim()
      .toLowerCase();
    if (!domain) {
      throw new InternalServerErrorException(
        'Falta GOOGLE_WORKSPACE_GROUP_DOMAIN en configuracion',
      );
    }
    return domain;
  }

  private getConfiguredStaffGroupEmail(): string {
    return String(
      technicalSettings.mediaAccess.staffViewersGroupEmail ||
        process.env.GOOGLE_WORKSPACE_STAFF_VIEWERS_GROUP_EMAIL ||
        '',
    )
      .trim()
      .toLowerCase();
  }
}
