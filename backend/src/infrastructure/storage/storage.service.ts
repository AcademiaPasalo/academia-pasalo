import {
  Injectable,
  OnModuleInit,
  Logger,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import { GoogleAuth } from 'google-auth-library';
import { technicalSettings } from '@config/technical-settings';
import {
  STORAGE_PROVIDER_CODES,
  type StorageProviderCode,
} from '@modules/materials/domain/material.constants';

type StoredFileDescriptor = {
  storageProvider: StorageProviderCode;
  storageKey: string;
  storageUrl: string | null;
};

@Injectable()
export class StorageService implements OnModuleInit {
  private readonly logger = new Logger(StorageService.name);
  private readonly uploadsFolderName = 'uploads';
  private readonly objectsFolderName = 'objects';
  private readonly archivedFolderName = 'archivado';
  private driveUploadsFolderId: string | null = null;
  private driveObjectsFolderId: string | null = null;
  private driveArchivedFolderId: string | null = null;
  private driveRootFolderId: string | null = null;
  private isDriveRootFolderValidated = false;
  private storagePath: string;
  private readonly storageProvider: StorageProviderCode;
  private readonly googleDriveServiceAccountKeyPath: string | null;
  private readonly googleDriveRootFolderIdConfig: string | null;

  constructor(private configService: ConfigService) {
    this.storagePath = this.configService.get<string>(
      'STORAGE_PATH',
      technicalSettings.uploads.storage.storagePathFallback,
    );
    const storageProviderRaw = (
      this.configService.get<string>(
        'STORAGE_PROVIDER',
        STORAGE_PROVIDER_CODES.LOCAL,
      ) || STORAGE_PROVIDER_CODES.LOCAL
    ).toUpperCase();
    if (
      storageProviderRaw !== STORAGE_PROVIDER_CODES.LOCAL &&
      storageProviderRaw !== STORAGE_PROVIDER_CODES.GDRIVE
    ) {
      throw new InternalServerErrorException(
        `STORAGE_PROVIDER invalido: ${storageProviderRaw}`,
      );
    }
    this.storageProvider = storageProviderRaw as StorageProviderCode;
    this.googleDriveServiceAccountKeyPath = this.configService.get<string>(
      'GOOGLE_APPLICATION_CREDENTIALS',
      null,
    );
    this.googleDriveRootFolderIdConfig = this.configService.get<string>(
      'GOOGLE_DRIVE_ROOT_FOLDER_ID',
      null,
    );
  }

  async onModuleInit() {
    if (this.isGoogleDriveEnabled()) {
      await this.ensureDriveFolderStructure();
      this.logger.log({
        message: 'Storage activo en Google Drive',
        provider: STORAGE_PROVIDER_CODES.GDRIVE,
      });
      return;
    }

    if (!fs.existsSync(this.storagePath)) {
      this.logger.log({
        message: 'Creando directorio de almacenamiento',
        path: this.storagePath,
      });
      await fs.promises.mkdir(this.storagePath, { recursive: true });
    }
  }

  async saveFile(
    fileName: string,
    buffer: Buffer,
    mimeType = 'application/octet-stream',
  ): Promise<StoredFileDescriptor> {
    if (this.isGoogleDriveEnabled()) {
      return await this.saveFileToGoogleDrive(fileName, buffer, mimeType);
    }

    const filePath = path.join(this.storagePath, fileName);
    await fs.promises.writeFile(filePath, buffer);
    return {
      storageProvider: STORAGE_PROVIDER_CODES.LOCAL,
      storageKey: fileName,
      storageUrl: filePath,
    };
  }

  async deleteFile(
    storageKey: string,
    storageProvider: StorageProviderCode,
    storageUrl?: string | null,
  ): Promise<void> {
    if (storageProvider === STORAGE_PROVIDER_CODES.GDRIVE) {
      await this.deleteFileFromGoogleDrive(storageKey);
      return;
    }

    if (storageProvider !== STORAGE_PROVIDER_CODES.LOCAL) {
      throw new InternalServerErrorException(
        `Proveedor de almacenamiento no soportado: ${storageProvider}`,
      );
    }

    const localKey = storageKey || this.extractLocalKeyFromUrl(storageUrl);
    if (!localKey) return;
    const filePath = path.join(this.storagePath, localKey);
    if (fs.existsSync(filePath)) {
      await fs.promises.unlink(filePath);
    }
  }

  async getFileStream(
    storageKey: string,
    storageProvider: StorageProviderCode,
    storageUrl?: string | null,
  ): Promise<NodeJS.ReadableStream> {
    if (storageProvider === STORAGE_PROVIDER_CODES.GDRIVE) {
      return await this.getGoogleDriveFileStream(storageKey);
    }

    if (storageProvider !== STORAGE_PROVIDER_CODES.LOCAL) {
      throw new InternalServerErrorException(
        `Proveedor de almacenamiento no soportado: ${storageProvider}`,
      );
    }

    const localKey = storageKey || this.extractLocalKeyFromUrl(storageUrl);
    if (!localKey) {
      throw new InternalServerErrorException(
        'Recurso local sin storageKey ni storageUrl',
      );
    }

    const filePath = path.join(this.storagePath, localKey);
    if (!fs.existsSync(filePath)) {
      throw new NotFoundException('Archivo local inexistente en el storage');
    }

    return fs.createReadStream(filePath);
  }

  calculateHash(buffer: Buffer): Promise<string> {
    const hash = crypto.createHash('sha256').update(buffer).digest('hex');
    return Promise.resolve(hash);
  }

  private isGoogleDriveEnabled(): boolean {
    return this.storageProvider === STORAGE_PROVIDER_CODES.GDRIVE;
  }

  private getGoogleAuth(): GoogleAuth {
    if (!this.googleDriveServiceAccountKeyPath) {
      throw new InternalServerErrorException(
        'Falta GOOGLE_APPLICATION_CREDENTIALS en configuracion',
      );
    }

    return new GoogleAuth({
      keyFile: this.googleDriveServiceAccountKeyPath,
      scopes: ['https://www.googleapis.com/auth/drive'],
    });
  }

  private async saveFileToGoogleDrive(
    fileName: string,
    buffer: Buffer,
    mimeType: string,
  ): Promise<StoredFileDescriptor> {
    const client = await this.getGoogleAuth().getClient();
    const folderId = await this.getDriveObjectsFolderId();

    const metadata = {
      name: fileName,
      parents: [folderId],
    };

    const boundary = `boundary-${Date.now()}-${Math.random().toString(16).slice(2)}`;
    const header = Buffer.from(
      `--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${JSON.stringify(metadata)}\r\n--${boundary}\r\nContent-Type: ${mimeType}\r\n\r\n`,
      'utf8',
    );
    const footer = Buffer.from(`\r\n--${boundary}--`, 'utf8');
    const body = Buffer.concat([header, buffer, footer]);

    const response = await client.request<{
      id: string;
      webViewLink?: string;
      webContentLink?: string;
    }>({
      url: 'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,webViewLink,webContentLink&supportsAllDrives=true',
      method: 'POST',
      headers: {
        'Content-Type': `multipart/related; boundary=${boundary}`,
      },
      data: body,
    });

    if (!response.data.id) {
      throw new InternalServerErrorException(
        'Google Drive no devolvio ID de archivo',
      );
    }

    return {
      storageProvider: STORAGE_PROVIDER_CODES.GDRIVE,
      storageKey: response.data.id,
      storageUrl:
        response.data.webContentLink ?? response.data.webViewLink ?? null,
    };
  }

  private async getGoogleDriveFileStream(
    fileId: string,
  ): Promise<NodeJS.ReadableStream> {
    const client = await this.getGoogleAuth().getClient();
    const response = await client.request<NodeJS.ReadableStream>({
      url: `https://www.googleapis.com/drive/v3/files/${encodeURIComponent(fileId)}?alt=media&supportsAllDrives=true`,
      method: 'GET',
      responseType: 'stream',
    });

    return response.data;
  }

  private async deleteFileFromGoogleDrive(fileId: string): Promise<void> {
    const client = await this.getGoogleAuth().getClient();
    try {
      await client.request({
        url: `https://www.googleapis.com/drive/v3/files/${encodeURIComponent(fileId)}?supportsAllDrives=true`,
        method: 'DELETE',
      });
    } catch (error) {
      const maybeError = error as {
        code?: number | string;
        response?: { status?: number; data?: unknown };
        message?: string;
      };
      const status = maybeError.response?.status ?? maybeError.code;
      if (status === 404) {
        // Deletion must be idempotent: if file is already gone, treat as success.
        this.logger.warn({
          message:
            'Archivo en Drive no encontrado al eliminar; se considera eliminado',
          fileId,
        });
        return;
      }
      throw error;
    }
  }

  private async getDriveUploadsFolderId(): Promise<string> {
    if (this.driveUploadsFolderId) return this.driveUploadsFolderId;

    const rootFolderId = await this.getDriveRootFolderId();
    const uploadsFolderId = await this.findOrCreateDriveFolderUnderParent(
      rootFolderId,
      this.uploadsFolderName,
    );

    this.driveUploadsFolderId = uploadsFolderId;
    return uploadsFolderId;
  }

  private async getDriveObjectsFolderId(): Promise<string> {
    if (this.driveObjectsFolderId) return this.driveObjectsFolderId;

    const uploadsFolderId = await this.getDriveUploadsFolderId();
    const objectsFolderId = await this.findOrCreateDriveFolderUnderParent(
      uploadsFolderId,
      this.objectsFolderName,
    );

    this.driveObjectsFolderId = objectsFolderId;
    return objectsFolderId;
  }

  private async getDriveArchivedFolderId(): Promise<string> {
    if (this.driveArchivedFolderId) return this.driveArchivedFolderId;

    const uploadsFolderId = await this.getDriveUploadsFolderId();
    const archivedFolderId = await this.findOrCreateDriveFolderUnderParent(
      uploadsFolderId,
      this.archivedFolderName,
    );

    this.driveArchivedFolderId = archivedFolderId;
    return archivedFolderId;
  }

  private async ensureDriveFolderStructure(): Promise<void> {
    const rootFolderId = await this.getDriveRootFolderId();
    const uploadsFolderId = await this.getDriveUploadsFolderId();
    const objectsFolderId = await this.getDriveObjectsFolderId();
    const archivedFolderId = await this.getDriveArchivedFolderId();

    this.logger.log({
      message: 'Estructura de carpetas de storage validada',
      rootFolderId,
      uploadsFolderId,
      objectsFolderId,
      archivedFolderId,
    });
  }

  private async getDriveRootFolderId(): Promise<string> {
    if (this.driveRootFolderId) return this.driveRootFolderId;

    if (!this.googleDriveRootFolderIdConfig) {
      throw new InternalServerErrorException(
        'Falta GOOGLE_DRIVE_ROOT_FOLDER_ID en configuracion',
      );
    }

    const rootFolderId = this.googleDriveRootFolderIdConfig;
    if (!this.isDriveRootFolderValidated) {
      await this.validateDriveFolderId(rootFolderId);
      this.isDriveRootFolderValidated = true;
    }

    this.driveRootFolderId = rootFolderId;
    return rootFolderId;
  }

  private async validateDriveFolderId(folderId: string): Promise<void> {
    const client = await this.getGoogleAuth().getClient();
    let response: {
      data: {
        id?: string;
        mimeType?: string;
        trashed?: boolean;
      };
    };
    try {
      response = await client.request<{
        id?: string;
        mimeType?: string;
        trashed?: boolean;
      }>({
        url: `https://www.googleapis.com/drive/v3/files/${encodeURIComponent(folderId)}?fields=id,mimeType,trashed&supportsAllDrives=true`,
        method: 'GET',
      });
    } catch (error) {
      const maybeError = error as {
        code?: number | string;
        message?: string;
        response?: { status?: number; data?: unknown };
      };
      const status =
        maybeError.response?.status ?? maybeError.code ?? 'UNKNOWN';
      const detailRaw =
        typeof maybeError.response?.data === 'string'
          ? maybeError.response.data
          : maybeError.message;
      const detail = detailRaw
        ? String(detailRaw).slice(0, 240)
        : 'sin detalle';
      throw new InternalServerErrorException(
        `GOOGLE_DRIVE_ROOT_FOLDER_ID invalido/sin permisos o falla de red hacia Google Drive (status=${status}, detail=${detail})`,
      );
    }

    if (!response.data.id) {
      throw new InternalServerErrorException(
        'GOOGLE_DRIVE_ROOT_FOLDER_ID invalido: no existe en Google Drive',
      );
    }

    if (response.data.mimeType !== 'application/vnd.google-apps.folder') {
      throw new InternalServerErrorException(
        'GOOGLE_DRIVE_ROOT_FOLDER_ID debe apuntar a una carpeta',
      );
    }

    if (response.data.trashed) {
      throw new InternalServerErrorException(
        'GOOGLE_DRIVE_ROOT_FOLDER_ID apunta a una carpeta en papelera',
      );
    }
  }

  private async findOrCreateDriveFolderUnderParent(
    parentFolderId: string,
    folderName: string,
  ): Promise<string> {
    const client = await this.getGoogleAuth().getClient();
    const query = `'${parentFolderId}' in parents and name='${folderName}' and mimeType='application/vnd.google-apps.folder' and trashed=false`;
    const searchResponse = await client.request<{
      files?: Array<{ id: string }>;
    }>({
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

    const createResponse = await client.request<{ id: string }>({
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

    if (!createResponse.data.id) {
      throw new InternalServerErrorException(
        `Google Drive no devolvio ID de carpeta ${folderName}`,
      );
    }

    return createResponse.data.id;
  }

  private extractLocalKeyFromUrl(storageUrl?: string | null): string | null {
    if (!storageUrl) return null;
    const name = storageUrl.split(/[\\/]/).pop();
    return name || null;
  }
}
