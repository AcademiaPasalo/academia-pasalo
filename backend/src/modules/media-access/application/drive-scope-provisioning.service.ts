import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleAuth } from 'google-auth-library';

type DriveFolderLookupResponse = {
  id?: string;
  mimeType?: string;
  trashed?: boolean;
};

type DriveFolderSearchResponse = {
  files?: Array<{ id: string }>;
};

type DriveFolderCreateResponse = {
  id?: string;
};

type DrivePermission = {
  id?: string;
  type?: string;
  role?: string;
  emailAddress?: string;
};

type DrivePermissionsResponse = {
  permissions?: DrivePermission[];
};

type GoogleRequestMethod = 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';

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

@Injectable()
export class DriveScopeProvisioningService {
  private readonly logger = new Logger(DriveScopeProvisioningService.name);

  constructor(private readonly configService: ConfigService) {}

  async provisionFolders(input: {
    parentFolderNames?: string[];
    baseFolderName: string;
    videosFolderName: string;
    documentsFolderName: string;
    archivedFolderName: string;
  }): Promise<{
    scopeFolderId: string;
    videosFolderId: string;
    documentsFolderId: string;
    archivedFolderId: string;
  }> {
    const client = await this.getDriveClient();
    const rootFolderId = this.getDriveRootFolderId();

    await this.validateFolderId(client, rootFolderId);

    const parentChain = this.normalizeFolderNames(
      input.parentFolderNames || [],
    );
    let baseParentFolderId = rootFolderId;
    for (const parentName of parentChain) {
      baseParentFolderId = await this.findOrCreateDriveFolderUnderParent(
        client,
        baseParentFolderId,
        parentName,
      );
    }

    const scopeFolderId = await this.findOrCreateDriveFolderUnderParent(
      client,
      baseParentFolderId,
      input.baseFolderName,
    );
    const videosFolderId = await this.findOrCreateDriveFolderUnderParent(
      client,
      scopeFolderId,
      input.videosFolderName,
    );
    const documentsFolderId = await this.findOrCreateDriveFolderUnderParent(
      client,
      scopeFolderId,
      input.documentsFolderName,
    );
    const archivedFolderId = await this.findOrCreateDriveFolderUnderParent(
      client,
      scopeFolderId,
      input.archivedFolderName,
    );

    return {
      scopeFolderId,
      videosFolderId,
      documentsFolderId,
      archivedFolderId,
    };
  }

  async ensureGroupReaderPermission(
    folderId: string,
    groupEmail: string,
  ): Promise<void> {
    const client = await this.getDriveClient();
    const normalizedGroupEmail = groupEmail.trim().toLowerCase();
    const permissions = await this.listPermissions(client, folderId);
    const existingPermission = permissions.find(
      (permission) =>
        permission.type === 'group' &&
        (permission.emailAddress || '').toLowerCase() === normalizedGroupEmail,
    );
    if (existingPermission) {
      return;
    }

    try {
      await client.request({
        url: `https://www.googleapis.com/drive/v3/files/${encodeURIComponent(folderId)}/permissions?supportsAllDrives=true&sendNotificationEmail=false`,
        method: 'POST',
        data: {
          type: 'group',
          role: 'reader',
          emailAddress: normalizedGroupEmail,
        },
        headers: {
          'Content-Type': 'application/json',
        },
      });
    } catch (error) {
      const status = this.getStatusFromError(error);
      if (status !== 409) {
        throw error;
      }
      // Idempotencia frente a carreras entre workers.
      return;
    }

    this.logger.log({
      message: 'Permiso reader de grupo aplicado en carpeta Drive',
      folderId,
      groupEmail: normalizedGroupEmail,
    });
  }

  private async getDriveClient(): Promise<GoogleRequestClient> {
    const keyFile = this.configService.get<string>(
      'GOOGLE_APPLICATION_CREDENTIALS',
      '',
    );
    if (!keyFile) {
      throw new InternalServerErrorException(
        'Falta GOOGLE_APPLICATION_CREDENTIALS en configuración',
      );
    }

    const auth = new GoogleAuth({
      keyFile,
      scopes: ['https://www.googleapis.com/auth/drive'],
    });
    const client = await auth.getClient();
    const requestClient = client as unknown as GoogleRequestClient;
    if (typeof requestClient.request !== 'function') {
      throw new InternalServerErrorException(
        'Cliente de Google Drive inválido',
      );
    }
    return requestClient;
  }

  private getDriveRootFolderId(): string {
    const rootFolderId = (
      this.configService.get<string>('GOOGLE_DRIVE_ROOT_FOLDER_ID', '') || ''
    ).trim();
    if (!rootFolderId) {
      throw new InternalServerErrorException(
        'Falta GOOGLE_DRIVE_ROOT_FOLDER_ID en configuración',
      );
    }
    return rootFolderId;
  }

  private async validateFolderId(
    client: GoogleRequestClient,
    folderId: string,
  ): Promise<void> {
    const response = await client.request<DriveFolderLookupResponse>({
      url: `https://www.googleapis.com/drive/v3/files/${encodeURIComponent(folderId)}?fields=id,mimeType,trashed&supportsAllDrives=true`,
      method: 'GET',
    });
    const payload = response.data;

    if (!payload.id) {
      throw new InternalServerErrorException(
        'GOOGLE_DRIVE_ROOT_FOLDER_ID inválido: no existe',
      );
    }
    if (payload.mimeType !== 'application/vnd.google-apps.folder') {
      throw new InternalServerErrorException(
        'GOOGLE_DRIVE_ROOT_FOLDER_ID debe apuntar a carpeta',
      );
    }
    if (payload.trashed) {
      throw new InternalServerErrorException(
        'GOOGLE_DRIVE_ROOT_FOLDER_ID apunta a carpeta en papelera',
      );
    }
  }

  private async findOrCreateDriveFolderUnderParent(
    client: GoogleRequestClient,
    parentFolderId: string,
    folderName: string,
  ): Promise<string> {
    const query = `'${parentFolderId}' in parents and name='${folderName}' and mimeType='application/vnd.google-apps.folder' and trashed=false`;
    const searchResponse = await client.request<DriveFolderSearchResponse>({
      url: `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&fields=files(id)&pageSize=2&supportsAllDrives=true&includeItemsFromAllDrives=true`,
      method: 'GET',
    });

    const matchedFolders = searchResponse.data.files || [];
    if (matchedFolders.length === 1) {
      return matchedFolders[0].id;
    }
    if (matchedFolders.length > 1) {
      throw new InternalServerErrorException(
        `Nombre de carpeta ambiguo bajo el mismo padre: ${folderName}`,
      );
    }

    const createResponse = await client.request<DriveFolderCreateResponse>({
      url: 'https://www.googleapis.com/drive/v3/files?supportsAllDrives=true',
      method: 'POST',
      data: {
        name: folderName,
        mimeType: 'application/vnd.google-apps.folder',
        parents: [parentFolderId],
      },
      headers: { 'Content-Type': 'application/json' },
    });

    const payload = createResponse.data;
    if (!payload.id) {
      throw new InternalServerErrorException(
        `Google Drive no devolvió ID de carpeta ${folderName}`,
      );
    }

    return payload.id;
  }

  private normalizeFolderNames(folderNames: string[]): string[] {
    return folderNames
      .map((name) => String(name || '').trim())
      .filter((name) => name.length > 0);
  }

  private async listPermissions(
    client: GoogleRequestClient,
    folderId: string,
  ): Promise<DrivePermission[]> {
    const response = await client.request<DrivePermissionsResponse>({
      url: `https://www.googleapis.com/drive/v3/files/${encodeURIComponent(folderId)}/permissions?fields=permissions(id,type,role,emailAddress)&supportsAllDrives=true`,
      method: 'GET',
    });
    return response.data.permissions || [];
  }

  private getStatusFromError(error: unknown): number | undefined {
    const maybeError = error as {
      code?: number;
      response?: { status?: number };
    };
    return maybeError.response?.status ?? maybeError.code;
  }
}
