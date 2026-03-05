import { InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JWT } from 'google-auth-library';
import { WorkspaceGroupsService } from '@modules/media-access/application/workspace-groups.service';

type WorkspaceGroupsServiceInternals = {
  getWorkspaceJwtClient: () => Promise<JWT>;
  findGroupByEmail: (
    client: JWT,
    groupEmail: string,
  ) => Promise<{ id: string; email: string } | null>;
  findGroupMemberByEmail: (
    client: JWT,
    groupEmail: string,
    memberEmail: string,
  ) => Promise<{ id?: string; email?: string } | null>;
};

describe('WorkspaceGroupsService', () => {
  const configService = {
    get: jest.fn(),
  } as unknown as ConfigService;

  let service: WorkspaceGroupsService;
  let internals: WorkspaceGroupsServiceInternals;
  let mockClient: JWT;

  beforeEach(() => {
    service = new WorkspaceGroupsService(configService);
    internals = service as unknown as WorkspaceGroupsServiceInternals;
    mockClient = {
      request: jest.fn(),
    } as unknown as JWT;
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should return existing group when already present', async () => {
    jest
      .spyOn(internals, 'getWorkspaceJwtClient')
      .mockResolvedValue(mockClient);
    jest.spyOn(internals, 'findGroupByEmail').mockResolvedValue({
      id: 'group-id',
      email: 'ev-1-viewers@academiapasalo.com',
    });

    const result = await service.findOrCreateGroup({
      email: 'EV-1-VIEWERS@ACADEMIAPASALO.COM',
      name: 'Group',
      description: 'desc',
    });

    expect(result.id).toBe('group-id');
    expect(result.email).toBe('ev-1-viewers@academiapasalo.com');
  });

  it('should recover from 409 conflict by re-reading group', async () => {
    jest
      .spyOn(internals, 'getWorkspaceJwtClient')
      .mockResolvedValue(mockClient);
    jest
      .spyOn(internals, 'findGroupByEmail')
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({
        id: 'group-id-2',
        email: 'ev-2-viewers@academiapasalo.com',
      });

    const requestMock = mockClient.request as unknown as jest.Mock;
    requestMock.mockRejectedValueOnce({ response: { status: 409 } });

    const result = await service.findOrCreateGroup({
      email: 'ev-2-viewers@academiapasalo.com',
      name: 'Group 2',
      description: 'desc 2',
    });

    expect(result.id).toBe('group-id-2');
    expect(internals.findGroupByEmail).toHaveBeenCalledTimes(2);
  });

  it('should throw when 409 conflict cannot be resolved', async () => {
    jest
      .spyOn(internals, 'getWorkspaceJwtClient')
      .mockResolvedValue(mockClient);
    jest.spyOn(internals, 'findGroupByEmail').mockResolvedValue(null);

    const requestMock = mockClient.request as unknown as jest.Mock;
    requestMock.mockRejectedValueOnce({ response: { status: 409 } });

    await expect(
      service.findOrCreateGroup({
        email: 'ev-3-viewers@academiapasalo.com',
        name: 'Group 3',
        description: 'desc 3',
      }),
    ).rejects.toBeInstanceOf(InternalServerErrorException);
  });

  it('should add member when member does not exist', async () => {
    jest
      .spyOn(internals, 'getWorkspaceJwtClient')
      .mockResolvedValue(mockClient);
    jest.spyOn(internals, 'findGroupMemberByEmail').mockResolvedValue(null);

    const requestMock = mockClient.request as unknown as jest.Mock;
    requestMock.mockResolvedValue({});

    await service.ensureMemberInGroup({
      groupEmail: 'ev-2-viewers@academiapasalo.com',
      memberEmail: 'student@academiapasalo.com',
    });

    expect(requestMock).toHaveBeenCalledWith(
      expect.objectContaining({
        method: 'POST',
      }),
    );
  });

  it('should treat 404 as idempotent when removing missing member', async () => {
    jest
      .spyOn(internals, 'getWorkspaceJwtClient')
      .mockResolvedValue(mockClient);
    const requestMock = mockClient.request as unknown as jest.Mock;
    requestMock.mockRejectedValueOnce({ response: { status: 404 } });

    await expect(
      service.removeMemberFromGroup({
        groupEmail: 'ev-2-viewers@academiapasalo.com',
        memberEmail: 'missing@academiapasalo.com',
      }),
    ).resolves.toBeUndefined();
  });

  it('should list group members with pagination and normalized emails', async () => {
    jest
      .spyOn(internals, 'getWorkspaceJwtClient')
      .mockResolvedValue(mockClient);
    const requestMock = mockClient.request as unknown as jest.Mock;
    requestMock
      .mockResolvedValueOnce({
        data: {
          members: [
            { email: 'Student1@AcademiaPasalo.com', role: 'MEMBER' },
            { email: 'owner@academiapasalo.com', role: 'OWNER' },
          ],
          nextPageToken: 'next-token',
        },
      })
      .mockResolvedValueOnce({
        data: {
          members: [{ email: 'student1@academiapasalo.com', role: 'MEMBER' }],
        },
      });

    const members = await service.listGroupMembers(
      'ev-2-viewers@academiapasalo.com',
    );

    expect(members).toHaveLength(2);
    expect(members[0].email).toBe('student1@academiapasalo.com');
  });

  it('should return empty member list when group does not exist', async () => {
    jest
      .spyOn(internals, 'getWorkspaceJwtClient')
      .mockResolvedValue(mockClient);
    const requestMock = mockClient.request as unknown as jest.Mock;
    requestMock.mockRejectedValueOnce({ response: { status: 404 } });

    await expect(
      service.listGroupMembers('missing-group@academiapasalo.com'),
    ).resolves.toEqual([]);
  });
});
