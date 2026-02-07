import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { SessionStatusRepository } from '@modules/auth/infrastructure/session-status.repository';
import type { EntityManager } from 'typeorm';

export type SessionStatusCode =
  | 'ACTIVE'
  | 'PENDING_CONCURRENT_RESOLUTION'
  | 'BLOCKED_PENDING_REAUTH'
  | 'REVOKED';

@Injectable()
export class SessionStatusService {
  private readonly cache = new Map<SessionStatusCode, string>();

  constructor(
    private readonly sessionStatusRepository: SessionStatusRepository,
  ) {}

  async getIdByCode(
    code: SessionStatusCode,
    manager?: EntityManager,
  ): Promise<string> {
    const cached = this.cache.get(code);
    if (cached !== undefined) {
      return cached;
    }

    const status = await this.sessionStatusRepository.findByCode(code, manager);
    if (!status) {
      throw new InternalServerErrorException(
        'Configuración de estados de sesión incompleta',
      );
    }

    this.cache.set(code, status.id);
    return status.id;
  }
}
