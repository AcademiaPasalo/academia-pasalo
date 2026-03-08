import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JWT } from 'google-auth-library';
import * as fs from 'fs';

type WorkspaceGroup = {
  id: string;
  email: string;
  name?: string;
  description?: string;
};

type WorkspaceGroupMember = {
  id?: string;
  email?: string;
  role?: string;
  status?: string;
};

type WorkspaceGroupMembersListResponse = {
  members?: WorkspaceGroupMember[];
  nextPageToken?: string;
};

@Injectable()
export class WorkspaceGroupsService {
  private readonly logger = new Logger(WorkspaceGroupsService.name);
  private workspaceJwtClient: JWT | null = null;

  constructor(private readonly configService: ConfigService) {}

  async findOrCreateGroup(input: {
    email: string;
    name: string;
    description: string;
  }): Promise<WorkspaceGroup> {
    const normalizedEmail = input.email.trim().toLowerCase();
    const client = await this.getWorkspaceJwtClient();

    const existing = await this.findGroupByEmail(client, normalizedEmail);
    if (existing) {
      return existing;
    }

    let response: { data: WorkspaceGroup };
    try {
      response = await client.request<WorkspaceGroup>({
        url: 'https://admin.googleapis.com/admin/directory/v1/groups',
        method: 'POST',
        data: {
          email: normalizedEmail,
          name: input.name.trim(),
          description: input.description.trim(),
        },
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (error) {
      const status = this.getStatusFromError(error);
      if (status !== 409) {
        throw error;
      }

      const afterConflict = await this.findGroupByEmail(
        client,
        normalizedEmail,
      );
      if (afterConflict) {
        return afterConflict;
      }
      throw new InternalServerErrorException(
        `Conflicto al crear grupo ${normalizedEmail} y no fue posible resolver estado final`,
      );
    }

    if (!response.data.id || !response.data.email) {
      throw new InternalServerErrorException(
        'Google Workspace no devolvió grupo válido',
      );
    }

    this.logger.log({
      message: 'Grupo Workspace creado',
      groupEmail: response.data.email,
      groupId: response.data.id,
    });

    return response.data;
  }

  async ensureMemberInGroup(input: {
    groupEmail: string;
    memberEmail: string;
  }): Promise<void> {
    const normalizedGroupEmail = input.groupEmail.trim().toLowerCase();
    const normalizedMemberEmail = input.memberEmail.trim().toLowerCase();
    const client = await this.getWorkspaceJwtClient();

    const existingMember = await this.findGroupMemberByEmail(
      client,
      normalizedGroupEmail,
      normalizedMemberEmail,
    );
    if (existingMember) {
      return;
    }

    try {
      await client.request({
        url: `https://admin.googleapis.com/admin/directory/v1/groups/${encodeURIComponent(normalizedGroupEmail)}/members`,
        method: 'POST',
        data: {
          email: normalizedMemberEmail,
          role: 'MEMBER',
        },
        headers: { 'Content-Type': 'application/json' },
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
      message: 'Miembro agregado a grupo Workspace',
      groupEmail: normalizedGroupEmail,
      memberEmail: normalizedMemberEmail,
    });
  }

  async removeMemberFromGroup(input: {
    groupEmail: string;
    memberEmail: string;
  }): Promise<void> {
    const normalizedGroupEmail = input.groupEmail.trim().toLowerCase();
    const normalizedMemberEmail = input.memberEmail.trim().toLowerCase();
    const client = await this.getWorkspaceJwtClient();

    try {
      await client.request({
        url: `https://admin.googleapis.com/admin/directory/v1/groups/${encodeURIComponent(normalizedGroupEmail)}/members/${encodeURIComponent(normalizedMemberEmail)}`,
        method: 'DELETE',
      });
    } catch (error) {
      const status = this.getStatusFromError(error);
      if (status !== 404) {
        throw error;
      }
      // Idempotencia para revocacion repetida.
      return;
    }

    this.logger.log({
      message: 'Miembro removido de grupo Workspace',
      groupEmail: normalizedGroupEmail,
      memberEmail: normalizedMemberEmail,
    });
  }

  async listGroupMembers(groupEmail: string): Promise<WorkspaceGroupMember[]> {
    const normalizedGroupEmail = groupEmail.trim().toLowerCase();
    const client = await this.getWorkspaceJwtClient();
    const deduplicatedMembers = new Map<string, WorkspaceGroupMember>();
    let pageToken: string | undefined;

    do {
      let response: { data: WorkspaceGroupMembersListResponse };
      try {
        const queryParams = new URLSearchParams({
          maxResults: '200',
        });
        if (pageToken) {
          queryParams.set('pageToken', pageToken);
        }
        response = await client.request<WorkspaceGroupMembersListResponse>({
          url: `https://admin.googleapis.com/admin/directory/v1/groups/${encodeURIComponent(normalizedGroupEmail)}/members?${queryParams.toString()}`,
          method: 'GET',
        });
      } catch (error) {
        const status = this.getStatusFromError(error);
        if (status === 404) {
          return [];
        }
        throw error;
      }

      const members = response.data.members || [];
      for (const member of members) {
        const normalizedMemberEmail = (member.email || '').trim().toLowerCase();
        if (!normalizedMemberEmail) {
          continue;
        }
        if (!deduplicatedMembers.has(normalizedMemberEmail)) {
          deduplicatedMembers.set(normalizedMemberEmail, {
            ...member,
            email: normalizedMemberEmail,
          });
        }
      }

      pageToken = response.data.nextPageToken;
    } while (pageToken);

    return Array.from(deduplicatedMembers.values());
  }

  async deleteGroupIfExists(groupEmail: string): Promise<void> {
    const normalizedGroupEmail = groupEmail.trim().toLowerCase();
    const client = await this.getWorkspaceJwtClient();
    try {
      await client.request({
        url: `https://admin.googleapis.com/admin/directory/v1/groups/${encodeURIComponent(normalizedGroupEmail)}`,
        method: 'DELETE',
      });
    } catch (error) {
      const status = this.getStatusFromError(error);
      if (status === 404) {
        return;
      }
      throw error;
    }

    this.logger.log({
      message: 'Grupo Workspace eliminado',
      groupEmail: normalizedGroupEmail,
    });
  }

  private async findGroupByEmail(
    client: JWT,
    groupEmail: string,
  ): Promise<WorkspaceGroup | null> {
    try {
      const response = await client.request<WorkspaceGroup>({
        url: `https://admin.googleapis.com/admin/directory/v1/groups/${encodeURIComponent(groupEmail)}`,
        method: 'GET',
      });
      if (!response.data.id || !response.data.email) {
        return null;
      }
      return response.data;
    } catch (error) {
      const maybeError = error as {
        code?: number;
        response?: { status?: number };
      };
      const status = maybeError.response?.status ?? maybeError.code;
      if (status === 404) {
        return null;
      }
      throw error;
    }
  }

  private async findGroupMemberByEmail(
    client: JWT,
    groupEmail: string,
    memberEmail: string,
  ): Promise<WorkspaceGroupMember | null> {
    try {
      const response = await client.request<WorkspaceGroupMember>({
        url: `https://admin.googleapis.com/admin/directory/v1/groups/${encodeURIComponent(groupEmail)}/members/${encodeURIComponent(memberEmail)}`,
        method: 'GET',
      });
      if (!response.data.email) {
        return null;
      }
      return response.data;
    } catch (error) {
      const status = this.getStatusFromError(error);
      if (status === 404) {
        return null;
      }
      throw error;
    }
  }

  private async getWorkspaceJwtClient(): Promise<JWT> {
    if (this.workspaceJwtClient) {
      return this.workspaceJwtClient;
    }

    const keyFile = this.configService.get<string>(
      'GOOGLE_APPLICATION_CREDENTIALS',
      '',
    );
    const adminEmail = (
      this.configService.get<string>('GOOGLE_WORKSPACE_ADMIN_EMAIL', '') || ''
    ).trim();

    if (!keyFile) {
      throw new InternalServerErrorException(
        'Falta GOOGLE_APPLICATION_CREDENTIALS en configuración',
      );
    }
    if (!adminEmail) {
      throw new InternalServerErrorException(
        'Falta GOOGLE_WORKSPACE_ADMIN_EMAIL en configuración',
      );
    }
    if (!fs.existsSync(keyFile)) {
      throw new InternalServerErrorException(
        `No existe archivo de credenciales: ${keyFile}`,
      );
    }

    const raw = await fs.promises.readFile(keyFile, 'utf8');
    let parsed: { client_email?: string; private_key?: string };
    try {
      parsed = JSON.parse(raw) as {
        client_email?: string;
        private_key?: string;
      };
    } catch {
      throw new InternalServerErrorException(
        'No se pudo parsear GOOGLE_APPLICATION_CREDENTIALS como JSON válido',
      );
    }

    if (!parsed.client_email || !parsed.private_key) {
      throw new InternalServerErrorException(
        'Credenciales de service account inválidas para Google Workspace',
      );
    }

    const client = new JWT({
      email: parsed.client_email,
      key: parsed.private_key,
      scopes: [
        'https://www.googleapis.com/auth/admin.directory.group',
        'https://www.googleapis.com/auth/admin.directory.group.member',
      ],
      subject: adminEmail,
    });
    await client.authorize();
    this.workspaceJwtClient = client;
    return this.workspaceJwtClient;
  }

  private getStatusFromError(error: unknown): number | undefined {
    const maybeError = error as {
      code?: number;
      response?: { status?: number };
    };
    return maybeError.response?.status ?? maybeError.code;
  }
}
