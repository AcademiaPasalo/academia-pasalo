import { InternalServerErrorException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { IdentitySecurityService } from '@modules/users/application/identity-security.service';
import { UserSessionRepository } from '@modules/auth/infrastructure/user-session.repository';
import { SessionStatusRepository } from '@modules/auth/infrastructure/session-status.repository';
import {
  IDENTITY_INVALIDATION_REASONS,
  SESSION_STATUS_CODES,
} from '@modules/auth/interfaces/security.constants';
import { RedisCacheService } from '@infrastructure/cache/redis-cache.service';
import { COURSE_CACHE_KEYS } from '@modules/courses/domain/course.constants';

describe('IdentitySecurityService', () => {
  let service: IdentitySecurityService;

  const userSessionRepositoryMock = {
    findActiveSessionsByUserId: jest.fn(),
    update: jest.fn(),
  };

  const sessionStatusRepositoryMock = {
    findByCode: jest.fn(),
  };

  const cacheServiceMock = {
    del: jest.fn(),
    invalidateGroup: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const moduleRef = await Test.createTestingModule({
      providers: [
        IdentitySecurityService,
        {
          provide: UserSessionRepository,
          useValue: userSessionRepositoryMock,
        },
        {
          provide: SessionStatusRepository,
          useValue: sessionStatusRepositoryMock,
        },
        { provide: RedisCacheService, useValue: cacheServiceMock },
      ],
    }).compile();

    service = moduleRef.get(IdentitySecurityService);
  });

  it('invalidación sensible sin revocación limpia caché de sesiones activas y perfil', async () => {
    userSessionRepositoryMock.findActiveSessionsByUserId.mockResolvedValue([
      { id: 's1' },
      { id: 's2' },
    ]);

    await service.invalidateUserIdentity('10', {
      revokeSessions: false,
      reason: IDENTITY_INVALIDATION_REASONS.SENSITIVE_UPDATE,
    });

    expect(userSessionRepositoryMock.update).not.toHaveBeenCalled();
    expect(cacheServiceMock.del).toHaveBeenNthCalledWith(
      1,
      'cache:session:s1:user',
    );
    expect(cacheServiceMock.del).toHaveBeenNthCalledWith(
      2,
      'cache:session:s2:user',
    );
    expect(cacheServiceMock.del).toHaveBeenNthCalledWith(
      3,
      'cache:user:profile:10',
    );
    expect(cacheServiceMock.invalidateGroup).toHaveBeenCalledWith(
      COURSE_CACHE_KEYS.GLOBAL_PROFESSOR_LIST_GROUP,
    );
  });

  it('baneo revoca sesiones activas y limpia caché', async () => {
    const revokedId = 'revoked-status-id';
    userSessionRepositoryMock.findActiveSessionsByUserId.mockResolvedValue([
      { id: 's1' },
    ]);
    sessionStatusRepositoryMock.findByCode.mockResolvedValue({ id: revokedId });

    await service.invalidateUserIdentity('10', {
      revokeSessions: true,
      reason: IDENTITY_INVALIDATION_REASONS.USER_BANNED,
    });

    expect(sessionStatusRepositoryMock.findByCode).toHaveBeenCalledWith(
      SESSION_STATUS_CODES.REVOKED,
      undefined,
    );
    expect(userSessionRepositoryMock.update).toHaveBeenCalledWith(
      's1',
      {
        sessionStatusId: revokedId,
        isActive: false,
      },
      undefined,
    );
    expect(cacheServiceMock.del).toHaveBeenCalledWith('cache:session:s1:user');
    expect(cacheServiceMock.del).toHaveBeenCalledWith('cache:user:profile:10');
    expect(cacheServiceMock.invalidateGroup).toHaveBeenCalledWith(
      COURSE_CACHE_KEYS.GLOBAL_PROFESSOR_LIST_GROUP,
    );
  });

  it('si no existe estado REVOKED lanza error de configuración', async () => {
    userSessionRepositoryMock.findActiveSessionsByUserId.mockResolvedValue([
      { id: 's1' },
    ]);
    sessionStatusRepositoryMock.findByCode.mockResolvedValue(null);

    await expect(
      service.invalidateUserIdentity('10', { revokeSessions: true }),
    ).rejects.toBeInstanceOf(InternalServerErrorException);
  });
});
