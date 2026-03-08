import { ConfigService } from '@nestjs/config';
import { DriveScopeProvisioningService } from '@modules/media-access/application/drive-scope-provisioning.service';

type DriveScopeProvisioningServiceInternals = {
  getDriveClient: () => Promise<{ request: jest.Mock }>;
  listPermissions: (
    client: { request: jest.Mock },
    folderId: string,
  ) => Promise<Array<{ type?: string; role?: string; emailAddress?: string }>>;
};

describe('DriveScopeProvisioningService', () => {
  const configService = {
    get: jest.fn(),
  } as unknown as ConfigService;

  let service: DriveScopeProvisioningService;
  let internals: DriveScopeProvisioningServiceInternals;
  let mockClient: { request: jest.Mock };

  beforeEach(() => {
    service = new DriveScopeProvisioningService(configService);
    internals = service as unknown as DriveScopeProvisioningServiceInternals;
    mockClient = {
      request: jest.fn(),
    };
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should not create permission when group already has any role', async () => {
    jest.spyOn(internals, 'getDriveClient').mockResolvedValue(mockClient);
    jest.spyOn(internals, 'listPermissions').mockResolvedValue([
      {
        type: 'group',
        role: 'writer',
        emailAddress: 'ev-1-viewers@academiapasalo.com',
      },
    ]);

    await service.ensureGroupReaderPermission(
      'folder-id',
      'ev-1-viewers@academiapasalo.com',
    );

    expect(mockClient.request).not.toHaveBeenCalled();
  });

  it('should tolerate 409 when creating permission concurrently', async () => {
    jest.spyOn(internals, 'getDriveClient').mockResolvedValue(mockClient);
    jest.spyOn(internals, 'listPermissions').mockResolvedValue([]);
    mockClient.request.mockRejectedValueOnce({ response: { status: 409 } });

    await expect(
      service.ensureGroupReaderPermission(
        'folder-id',
        'ev-2-viewers@academiapasalo.com',
      ),
    ).resolves.toBeUndefined();
  });
});
