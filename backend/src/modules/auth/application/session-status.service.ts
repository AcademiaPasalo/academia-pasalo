import {
  Injectable,
  InternalServerErrorException,
  OnModuleInit,
  Logger,
} from '@nestjs/common';
import { SessionStatusRepository } from '@modules/auth/infrastructure/session-status.repository';
import type { EntityManager } from 'typeorm';
import { type SessionStatusCodeValue } from '@modules/auth/interfaces/security.constants';

export type SessionStatusCode = SessionStatusCodeValue;

@Injectable()
export class SessionStatusService implements OnModuleInit {
  private readonly logger = new Logger(SessionStatusService.name);
  private readonly cache = new Map<SessionStatusCode, string>();

  constructor(
    private readonly sessionStatusRepository: SessionStatusRepository,
  ) {}

  async onModuleInit() {
    await this.refreshCache();
  }

  async refreshCache() {
    try {
      const statuses = await this.sessionStatusRepository.findAll();
      this.cache.clear();
      for (const status of statuses) {
        this.cache.set(status.code as SessionStatusCode, status.id);
      }
      this.logger.debug({
        level: 'debug',
        context: SessionStatusService.name,
        message: 'Caché de estados de sesión cargada',
        count: this.cache.size,
      });
    } catch (error) {
      this.logger.error({
        level: 'error',
        context: SessionStatusService.name,
        message: 'Error al precargar caché de estados de sesión',
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  async getIdByCode(
    code: SessionStatusCode,
    manager?: EntityManager,
  ): Promise<string> {
    const cached = this.cache.get(code);
    if (cached !== undefined && !manager) {
      return cached;
    }

    const status = await this.sessionStatusRepository.findByCode(code, manager);
    if (!status) {
      this.logger.warn({
        level: 'warn',
        context: SessionStatusService.name,
        message: 'Estado de sesión no encontrado en BD',
        code,
      });
      throw new InternalServerErrorException(
        'Configuración de estados de sesión incompleta',
      );
    }

    if (!manager) {
      this.cache.set(code, status.id);
    }
    return status.id;
  }

  clearCache() {
    this.cache.clear();
  }
}
