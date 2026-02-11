import {
  Injectable,
  Logger,
  InternalServerErrorException,
} from '@nestjs/common';
import { SecurityEventRepository } from '@modules/auth/infrastructure/security-event.repository';
import { SecurityEventTypeRepository } from '@modules/auth/infrastructure/security-event-type.repository';
import { SecurityEvent } from '@modules/auth/domain/security-event.entity';
import type { EntityManager } from 'typeorm';

@Injectable()
export class SecurityEventService {
  private readonly logger = new Logger(SecurityEventService.name);

  constructor(
    private readonly securityEventRepository: SecurityEventRepository,
    private readonly securityEventTypeRepository: SecurityEventTypeRepository,
  ) {}

  async logEvent(
    userId: string,
    eventCode: string,
    context?: Record<string, unknown>,
    manager?: EntityManager,
  ): Promise<SecurityEvent | null> {
    const eventType = await this.securityEventTypeRepository.findByCode(
      eventCode,
      manager,
    );

    if (!eventType) {
      this.logger.warn({
        level: 'warn',
        context: SecurityEventService.name,
        message: 'Tipo de evento de seguridad no encontrado en base de datos',
        eventCode,
        userId,
        extra: context || null,
      });
      throw new InternalServerErrorException(
        'Configuración de auditoría de seguridad incompleta',
      );
    }

    const eventDatetime = new Date();
    const { ipAddress, userAgent, metadata } = this.normalizeContext(context);

    const securityEvent = await this.securityEventRepository.create(
      {
        userId,
        securityEventTypeId: eventType.id,
        eventDatetime,
        ipAddress,
        userAgent,
        metadata,
      },
      manager,
    );

    this.logger.log({
      level: 'info',
      context: SecurityEventService.name,
      message: 'Evento de seguridad registrado',
      userId,
      eventCode,
      eventId: securityEvent.id,
      extra: context || null,
    });

    return securityEvent;
  }

  async getUserSecurityEvents(
    userId: string,
    limit = 50,
  ): Promise<SecurityEvent[]> {
    return await this.securityEventRepository.findByUserId(userId, limit);
  }

  async countEventsByCode(
    userId: string,
    eventCode: string,
    manager?: EntityManager,
  ): Promise<number> {
    return await this.securityEventRepository.countByUserIdAndTypeCode(
      userId,
      eventCode,
      manager,
    );
  }

  private normalizeContext(context?: Record<string, unknown>): {
    ipAddress: string | null;
    userAgent: string | null;
    metadata: Record<string, unknown> | null;
  } {
    if (!context) {
      return { ipAddress: null, userAgent: null, metadata: null };
    }

    const record = context;
    const ip = record.ipAddress;
    const ua = record.userAgent;

    const ipAddress = typeof ip === 'string' ? ip : null;
    const userAgent = typeof ua === 'string' ? ua : null;

    const metadata: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(record)) {
      if (key === 'ipAddress' || key === 'userAgent') {
        continue;
      }
      metadata[key] = value;
    }

    return {
      ipAddress,
      userAgent,
      metadata: Object.keys(metadata).length > 0 ? metadata : null,
    };
  }
}
