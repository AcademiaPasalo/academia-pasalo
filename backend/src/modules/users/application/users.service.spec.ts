import { ConflictException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import type { EntityManager } from 'typeorm';
import { DataSource } from 'typeorm';

import { UsersService } from '@modules/users/application/users.service';
import { UserRepository } from '@modules/users/infrastructure/user.repository';
import { RoleRepository } from '@modules/users/infrastructure/role.repository';
import { PhotoSource } from '@modules/users/domain/user.entity';
import type { DatabaseError } from '@common/interfaces/database-error.interface';
import { MySqlErrorCode } from '@common/interfaces/database-error.interface';

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

  beforeEach(async () => {
    jest.clearAllMocks();

    const moduleRef = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: DataSource, useValue: dataSourceMock },
        { provide: UserRepository, useValue: userRepositoryMock },
        { provide: RoleRepository, useValue: roleRepositoryMock },
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
      createdAt: new Date(),
      updatedAt: null,
      roles: [],
    };

    userRepositoryMock.findById.mockResolvedValue(user);
    roleRepositoryMock.findByCode.mockResolvedValue({
      id: '2',
      code: 'ADMIN',
      name: 'Admin',
    });

    const error: DatabaseError = {
      driverError: { errno: MySqlErrorCode.DUPLICATE_ENTRY },
    };
    userRepositoryMock.save.mockRejectedValue(error);

    await expect(usersService.assignRole('1', 'ADMIN')).rejects.toBeInstanceOf(
      ConflictException,
    );
  });
});
