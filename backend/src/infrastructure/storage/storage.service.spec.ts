import {
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import { StorageService } from '@infrastructure/storage/storage.service';
import * as GoogleAuthLibrary from 'google-auth-library';

jest.mock('google-auth-library', () => ({
  __esModule: true,
  __mockGetClient: jest.fn(),
  GoogleAuth: jest.fn().mockImplementation(() => ({
    getClient: jest.requireMock('google-auth-library').__mockGetClient,
  })),
}));

describe('StorageService', () => {
  const googleAuthMocks = GoogleAuthLibrary as unknown as {
    __mockGetClient: jest.Mock;
    GoogleAuth: jest.Mock;
  };

  afterEach(() => {
    jest.clearAllMocks();
    googleAuthMocks.__mockGetClient.mockReset();
    jest.restoreAllMocks();
  });

  const createConfigService = (
    values: Record<string, string | null | undefined>,
  ) =>
    ({
      get: (key: string, fallback?: string | null) =>
        values[key] !== undefined ? values[key] : fallback,
    }) as ConfigService;

  it('should save local files returning provider metadata', async () => {
    const configService = createConfigService({
      GOOGLE_APPLICATION_CREDENTIALS: null,
      STORAGE_PATH: 'uploads',
    });
    const service = new StorageService(configService);

    jest.spyOn(fs.promises, 'writeFile').mockResolvedValue(undefined);

    const result = await service.saveFile(
      'file.pdf',
      Buffer.from('abc'),
      'application/pdf',
    );

    expect(result.storageProvider).toBe('LOCAL');
    expect(result.storageKey).toBe('file.pdf');
    expect(result.storageUrl).toContain('file.pdf');
  });

  it('should throw NotFoundException when local file stream does not exist', async () => {
    const configService = createConfigService({
      GOOGLE_APPLICATION_CREDENTIALS: null,
      STORAGE_PATH: 'uploads',
    });
    const service = new StorageService(configService);
    const missingFileName = `missing-${Date.now()}-${Math.random().toString(16).slice(2)}.pdf`;

    await expect(
      service.getFileStream(missingFileName, 'LOCAL'),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('should require GOOGLE_DRIVE_ROOT_FOLDER_ID when drive is enabled', async () => {
    const configService = createConfigService({
      GOOGLE_APPLICATION_CREDENTIALS: 'C:\\secret.json',
      GOOGLE_DRIVE_ROOT_FOLDER_ID: null,
    });
    const service = new StorageService(configService);

    await expect(service.onModuleInit()).rejects.toBeInstanceOf(
      InternalServerErrorException,
    );
  });

  it('should ignore legacy GOOGLE_DRIVE_SERVICE_ACCOUNT_KEY_PATH when GOOGLE_APPLICATION_CREDENTIALS is missing', async () => {
    const configService = createConfigService({
      GOOGLE_APPLICATION_CREDENTIALS: null,
      GOOGLE_DRIVE_SERVICE_ACCOUNT_KEY_PATH: 'C:\\legacy-secret.json',
      STORAGE_PATH: 'uploads',
    });
    const service = new StorageService(configService);

    jest.spyOn(fs.promises, 'writeFile').mockResolvedValue(undefined);

    await expect(
      service.saveFile('legacy-test.pdf', Buffer.from('abc'), 'application/pdf'),
    ).resolves.toMatchObject({ storageProvider: 'LOCAL' });
    expect(googleAuthMocks.GoogleAuth).not.toHaveBeenCalled();
  });

  it('should fail when root folder id is invalid or inaccessible', async () => {
    const configService = createConfigService({
      GOOGLE_APPLICATION_CREDENTIALS: 'C:\\secret.json',
      GOOGLE_DRIVE_ROOT_FOLDER_ID: 'invalid-root-id',
    });
    const service = new StorageService(configService);
    const mockClient = {
      request: jest.fn().mockRejectedValue(new Error('not found')),
    };
    googleAuthMocks.__mockGetClient.mockResolvedValue(mockClient);

    await expect(service.onModuleInit()).rejects.toBeInstanceOf(
      InternalServerErrorException,
    );
  });

  it('should create uploads, objects and archivado folders under root on init', async () => {
    const configService = createConfigService({
      GOOGLE_APPLICATION_CREDENTIALS: 'C:\\secret.json',
      GOOGLE_DRIVE_ROOT_FOLDER_ID: 'root-1',
    });
    const service = new StorageService(configService);
    const mockClient = {
      request: jest
        .fn()
        .mockResolvedValueOnce({
          data: {
            id: 'root-1',
            mimeType: 'application/vnd.google-apps.folder',
            trashed: false,
          },
        })
        .mockResolvedValueOnce({ data: { files: [] } })
        .mockResolvedValueOnce({ data: { id: 'uploads-id' } })
        .mockResolvedValueOnce({ data: { files: [] } })
        .mockResolvedValueOnce({ data: { id: 'objects-id' } })
        .mockResolvedValueOnce({ data: { files: [] } })
        .mockResolvedValueOnce({ data: { id: 'archivado-id' } }),
    };
    googleAuthMocks.__mockGetClient.mockResolvedValue(mockClient);

    await service.onModuleInit();

    const createCalls = mockClient.request.mock.calls
      .map((call) => call[0])
      .filter(
        (req) =>
          req.method === 'POST' &&
          req.data?.mimeType === 'application/vnd.google-apps.folder',
      );
    expect(createCalls).toHaveLength(3);
    expect(createCalls[0].data.name).toBe('uploads');
    expect(createCalls[1].data.name).toBe('objects');
    expect(createCalls[2].data.name).toBe('archivado');
  });

  it('should upload files to Google Drive objects folder', async () => {
    const configService = createConfigService({
      GOOGLE_APPLICATION_CREDENTIALS: 'C:\\secret.json',
      GOOGLE_DRIVE_ROOT_FOLDER_ID: 'root-1',
    });
    const service = new StorageService(configService);
    const mockClient = {
      request: jest
        .fn()
        .mockResolvedValueOnce({
          data: {
            id: 'root-1',
            mimeType: 'application/vnd.google-apps.folder',
            trashed: false,
          },
        })
        .mockResolvedValueOnce({ data: { files: [{ id: 'uploads-id' }] } })
        .mockResolvedValueOnce({ data: { files: [{ id: 'objects-id' }] } })
        .mockResolvedValueOnce({
          data: {
            id: 'drive-file-id',
            webContentLink: 'https://drive/content',
          },
        }),
    };
    googleAuthMocks.__mockGetClient.mockResolvedValue(mockClient);

    const result = await service.saveFile(
      'demo.pdf',
      Buffer.from('abc'),
      'application/pdf',
    );

    expect(result).toEqual({
      storageProvider: 'GDRIVE',
      storageKey: 'drive-file-id',
      storageUrl: 'https://drive/content',
    });
  });

  it('should reject root folder id when file is not a folder', async () => {
    const configService = createConfigService({
      GOOGLE_APPLICATION_CREDENTIALS: 'C:\\secret.json',
      GOOGLE_DRIVE_ROOT_FOLDER_ID: 'not-folder',
    });
    const service = new StorageService(configService);
    const mockClient = {
      request: jest.fn().mockResolvedValue({
        data: { id: 'not-folder', mimeType: 'application/pdf', trashed: false },
      }),
    };
    googleAuthMocks.__mockGetClient.mockResolvedValue(mockClient);

    await expect(service.onModuleInit()).rejects.toBeInstanceOf(
      InternalServerErrorException,
    );
  });

  it('should reject root folder id when folder is trashed', async () => {
    const configService = createConfigService({
      GOOGLE_APPLICATION_CREDENTIALS: 'C:\\secret.json',
      GOOGLE_DRIVE_ROOT_FOLDER_ID: 'trashed-folder',
    });
    const service = new StorageService(configService);
    const mockClient = {
      request: jest.fn().mockResolvedValue({
        data: {
          id: 'trashed-folder',
          mimeType: 'application/vnd.google-apps.folder',
          trashed: true,
        },
      }),
    };
    googleAuthMocks.__mockGetClient.mockResolvedValue(mockClient);

    await expect(service.onModuleInit()).rejects.toBeInstanceOf(
      InternalServerErrorException,
    );
  });

  it('should throw for unsupported storage provider in deleteFile', async () => {
    const configService = createConfigService({
      GOOGLE_APPLICATION_CREDENTIALS: null,
      STORAGE_PATH: 'uploads',
    });
    const service = new StorageService(configService);

    await expect(service.deleteFile('key', 'S3' as any)).rejects.toBeInstanceOf(
      InternalServerErrorException,
    );
  });
});
