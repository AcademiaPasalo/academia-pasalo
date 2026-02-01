import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { EntityManager } from 'typeorm';
import { UserSession } from '@modules/auth/domain/user-session.entity';

@Injectable()
export class UserSessionRepository {
  constructor(
    @InjectRepository(UserSession)
    private readonly ormRepository: Repository<UserSession>,
  ) {}

  private getRepository(manager?: EntityManager): Repository<UserSession> {
    return manager ? manager.getRepository(UserSession) : this.ormRepository;
  }

  async create(
    sessionData: Omit<
      Partial<UserSession>,
      | 'userId'
      | 'deviceId'
      | 'ipAddress'
      | 'refreshTokenHash'
      | 'sessionStatusId'
      | 'expiresAt'
      | 'lastActivityAt'
      | 'isActive'
      | 'createdAt'
    > & {
      userId: string;
      deviceId: string;
      ipAddress: string;
      refreshTokenHash: string;
      sessionStatusId: string;
      expiresAt: Date;
      lastActivityAt: Date;
      isActive: boolean;
      createdAt: Date;
    },
    manager?: EntityManager,
  ): Promise<UserSession> {
    const repo = this.getRepository(manager);
    const session = repo.create(sessionData);
    return await repo.save(session);
  }

  async findById(id: string, manager?: EntityManager): Promise<UserSession | null> {
    const repo = this.getRepository(manager);
    return await repo.findOne({
      where: { id },
    });
  }

  async findByIdWithUser(id: string, manager?: EntityManager): Promise<UserSession | null> {
    const repo = this.getRepository(manager);
    return await repo.findOne({
      where: { id },
      relations: { user: { roles: true } },
    });
  }

  async findActiveById(id: string, manager?: EntityManager): Promise<UserSession | null> {
    const repo = this.getRepository(manager);
    return await repo.findOne({
      where: { id, isActive: true },
    });
  }

  async findActiveByRefreshTokenHash(
    refreshTokenHash: string,
    manager?: EntityManager,
  ): Promise<UserSession | null> {
    const repo = this.getRepository(manager);
    return await repo.findOne({
      where: { refreshTokenHash, isActive: true },
    });
  }

  async findByRefreshTokenHash(
    refreshTokenHash: string,
    manager?: EntityManager,
  ): Promise<UserSession | null> {
    const repo = this.getRepository(manager);
    return await repo.findOne({
      where: { refreshTokenHash },
    });
  }

  async findActiveSessionsByUserId(userId: string, manager?: EntityManager): Promise<UserSession[]> {
    const repo = this.getRepository(manager);
    return await repo.find({
      where: { userId, isActive: true },
      order: { lastActivityAt: 'DESC' },
    });
  }

  async findLatestSessionByUserId(userId: string, manager?: EntityManager): Promise<UserSession | null> {
    const repo = this.getRepository(manager);
    return await repo.findOne({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  async findOtherActiveSession(
    userId: string,
    deviceId: string,
    activeStatusId: string,
    manager?: EntityManager,
  ): Promise<UserSession | null> {
    const repo = this.getRepository(manager);
    return await repo
      .createQueryBuilder('s')
      .where('s.userId = :userId', { userId })
      .andWhere('s.deviceId <> :deviceId', { deviceId })
      .andWhere('s.sessionStatusId = :activeStatusId', { activeStatusId })
      .andWhere('s.expiresAt > :now', { now: new Date() })
      .orderBy('s.createdAt', 'DESC')
      .getOne();
  }

  async countActiveSessionsByUserId(userId: string, manager?: EntityManager): Promise<number> {
    const repo = this.getRepository(manager);
    return await repo.count({
      where: { userId, isActive: true },
    });
  }

  async update(
    id: string,
    sessionData: Partial<UserSession>,
    manager?: EntityManager,
  ): Promise<UserSession> {
    const repo = this.getRepository(manager);
    await repo.update(id, sessionData);
    const session = await this.findById(id, manager);
    if (!session) {
      throw new InternalServerErrorException('Sesión no encontrada después de actualizar');
    }
    return session;
  }

  async deactivateSession(id: string, manager?: EntityManager): Promise<void> {
    const repo = this.getRepository(manager);
    await repo.update(id, { isActive: false });
  }

  async save(session: UserSession, manager?: EntityManager): Promise<UserSession> {
    const repo = this.getRepository(manager);
    return await repo.save(session);
  }

  async findByRefreshTokenHashForUpdate(
    refreshTokenHash: string,
    manager: EntityManager,
  ): Promise<UserSession | null> {
    return await manager
      .getRepository(UserSession)
      .createQueryBuilder('s')
      .setLock('pessimistic_write')
      .where('s.refreshTokenHash = :refreshTokenHash', { refreshTokenHash })
      .getOne();
  }

  async findByIdForUpdate(id: string, manager: EntityManager): Promise<UserSession | null> {
    return await manager
      .getRepository(UserSession)
      .createQueryBuilder('s')
      .setLock('pessimistic_write')
      .where('s.id = :id', { id })
      .getOne();
  }
}
