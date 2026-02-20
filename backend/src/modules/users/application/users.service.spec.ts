import { ConflictException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import type { EntityManager } from 'typeorm';
import { DataSource } from 'typeorm';

import { UsersService } from '@modules/users/application/users.service';
import { IdentitySecurityService } from '@modules/users/application/identity-security.service';
import { UserRepository } from '@modules/users/infrastructure/user.repository';
import { RoleRepository } from '@modules/users/infrastructure/role.repository';
import { PhotoSource } from '@modules/users/domain/user.entity';
import { IDENTITY_INVALIDATION_REASONS } from '@modules/auth/interfaces/security.constants';
import type { DatabaseError } from '@common/interfaces/database-error.interface';
import { MySqlErrorCode } from '@common/interfaces/database-error.interface';
import { ROLE_CODES } from '@common/constants/role-codes.constants';

describe('UsersService', () => {
  let usersService: UsersService;

  const dataSourceMock = {
    transaction: jest.fn(
      async (cb: (manager: EntityManager) => unknown) =>
        await cb({} as EntityManager),
    ),
  };

  const userRepositoryMock = {
    findById: jest.fn(),
    save: jest.fn(),
    findByEmail: jest.fn(),
    create: jest.fn(),
    delete: jest.fn(),
    findAll: jest.fn(),
  };

  const roleRepositoryMock = {
    findByCode: jest.fn(),
    findAll: jest.fn(),
  };

  const identitySecurityServiceMock = {
    invalidateUserIdentity: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const moduleRef = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: DataSource, useValue: dataSourceMock },
        { provide: UserRepository, useValue: userRepositoryMock },
        { provide: RoleRepository, useValue: roleRepositoryMock },
        {
          provide: IdentitySecurityService,
          useValue: identitySecurityServiceMock,
        },
      ],
    }).compile();

    usersService = moduleRef.get(UsersService);
  });

  it('assignRole: duplicate entry -> ConflictException', async () => {
    const user = {
      id: '1',
      email: 'a@test.com',
      firstName: 'A',
      lastName1: null,
      lastName2: null,
      phone: null,
      career: null,
      profilePhotoUrl: null,
      photoSource: PhotoSource.NONE,
      isActive: true,
      createdAt: new Date(),
      updatedAt: null,
      roles: [],
    };

    userRepositoryMock.findById.mockResolvedValue(user);
    roleRepositoryMock.findByCode.mockResolvedValue({
      id: '2',
      code: ROLE_CODES.ADMIN,
      name: 'Admin',
    });

    const error: DatabaseError = {
      driverError: { errno: MySqlErrorCode.DUPLICATE_ENTRY },
    };
    userRepositoryMock.save.mockRejectedValue(error);

    await expect(
      usersService.assignRole('1', ROLE_CODES.ADMIN),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('assignRole: éxito invalida identidad por cambio de rol', async () => {
    const user = {
      id: '1',
      email: 'a@test.com',
      firstName: 'A',
      lastName1: null,
      lastName2: null,
      phone: null,
      career: null,
      profilePhotoUrl: null,
      photoSource: PhotoSource.NONE,
      isActive: true,
      createdAt: new Date(),
      updatedAt: null,
      roles: [],
    };
    const role = { id: '2', code: ROLE_CODES.ADMIN, name: 'Admin' };

    userRepositoryMock.findById.mockResolvedValue(user);
    roleRepositoryMock.findByCode.mockResolvedValue(role);
    userRepositoryMock.save.mockResolvedValue({
      ...user,
      roles: [role],
    });

    await usersService.assignRole('1', ROLE_CODES.ADMIN);

    expect(
      identitySecurityServiceMock.invalidateUserIdentity,
    ).toHaveBeenCalledWith(
      '1',
      expect.objectContaining({
        revokeSessions: false,
        reason: IDENTITY_INVALIDATION_REASONS.ROLE_CHANGE,
      }),
    );
  });

  it('update: cambio de email invalida identidad sin revocar sesiones', async () => {
    const existing = {
      id: '1',
      email: 'old@test.com',
      firstName: 'A',
      lastName1: null,
      lastName2: null,
      phone: null,
      career: null,
      profilePhotoUrl: null,
      photoSource: PhotoSource.NONE,
      isActive: true,
      createdAt: new Date(),
      updatedAt: null,
      roles: [],
    };

    userRepositoryMock.findById.mockResolvedValue(existing);
    userRepositoryMock.findByEmail.mockResolvedValue(null);
    userRepositoryMock.save.mockResolvedValue({
      ...existing,
      email: 'new@test.com',
    });

    await usersService.update('1', { email: 'new@test.com' });

    expect(
      identitySecurityServiceMock.invalidateUserIdentity,
    ).toHaveBeenCalledWith(
      '1',
      expect.objectContaining({
        revokeSessions: false,
        reason: IDENTITY_INVALIDATION_REASONS.SENSITIVE_UPDATE,
      }),
    );
  });

  it('update: baneo revoca sesiones e invalida identidad', async () => {
    const existing = {
      id: '1',
      email: 'user@test.com',
      firstName: 'A',
      lastName1: null,
      lastName2: null,
      phone: null,
      career: null,
      profilePhotoUrl: null,
      photoSource: PhotoSource.NONE,
      isActive: true,
      createdAt: new Date(),
      updatedAt: null,
      roles: [],
    };

    userRepositoryMock.findById.mockResolvedValue(existing);
    userRepositoryMock.save.mockResolvedValue({
      ...existing,
      isActive: false,
    });

    await usersService.update('1', { isActive: false });

    expect(
      identitySecurityServiceMock.invalidateUserIdentity,
    ).toHaveBeenCalledWith(
      '1',
      expect.objectContaining({
        revokeSessions: true,
        reason: IDENTITY_INVALIDATION_REASONS.USER_BANNED,
      }),
    );
  });

  it('update: cambio de nombre invalida identidad y caché de profesores', async () => {
    const existing = {
      id: '1',
      email: 'user@test.com',
      firstName: 'Original',
      isActive: true,
      roles: [],
    };

    userRepositoryMock.findById.mockResolvedValue(existing);
    userRepositoryMock.save.mockResolvedValue({
      ...existing,
      firstName: 'Nuevo Nombre',
    });

    await usersService.update('1', { firstName: 'Nuevo Nombre' });

    expect(
      identitySecurityServiceMock.invalidateUserIdentity,
    ).toHaveBeenCalledWith(
      '1',
      expect.objectContaining({
        reason: IDENTITY_INVALIDATION_REASONS.SENSITIVE_UPDATE,
      }),
    );
  });

  it('update: desbaneo invalida identidad sin revocar sesiones antiguas', async () => {
    const existing = {
      id: '1',
      email: 'user@test.com',
      firstName: 'A',
      lastName1: null,
      lastName2: null,
      phone: null,
      career: null,
      profilePhotoUrl: null,
      photoSource: PhotoSource.NONE,
      isActive: false,
      createdAt: new Date(),
      updatedAt: null,
      roles: [],
    };

    userRepositoryMock.findById.mockResolvedValue(existing);
    userRepositoryMock.save.mockResolvedValue({
      ...existing,
      isActive: true,
    });

    await usersService.update('1', { isActive: true });

    expect(
      identitySecurityServiceMock.invalidateUserIdentity,
    ).toHaveBeenCalledWith(
      '1',
      expect.objectContaining({
        revokeSessions: false,
        reason: IDENTITY_INVALIDATION_REASONS.SENSITIVE_UPDATE,
      }),
    );
  });

  it('removeRole: éxito invalida identidad por cambio de rol', async () => {
    const role = { id: '2', code: ROLE_CODES.ADMIN, name: 'Admin' };
    const user = {
      id: '1',
      email: 'a@test.com',
      firstName: 'A',
      lastName1: null,
      lastName2: null,
      phone: null,
      career: null,
      profilePhotoUrl: null,
      photoSource: PhotoSource.NONE,
      isActive: true,
      createdAt: new Date(),
      updatedAt: null,
      roles: [role],
    };

    userRepositoryMock.findById.mockResolvedValue(user);
    userRepositoryMock.save.mockResolvedValue({
      ...user,
      roles: [],
    });

    await usersService.removeRole('1', ROLE_CODES.ADMIN);

    expect(
      identitySecurityServiceMock.invalidateUserIdentity,
    ).toHaveBeenCalledWith(
      '1',
      expect.objectContaining({
        revokeSessions: false,
        reason: IDENTITY_INVALIDATION_REASONS.ROLE_CHANGE,
      }),
    );
  });
});
