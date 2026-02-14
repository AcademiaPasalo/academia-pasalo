import { Test, TestingModule } from '@nestjs/testing';
import { getQueueToken } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { AuditService } from './audit.service';
import { AuditLogRepository } from '@modules/audit/infrastructure/audit-log.repository';
import { AuditActionRepository } from '@modules/audit/infrastructure/audit-action.repository';
import { SecurityEventRepository } from '@modules/auth/infrastructure/security-event.repository';
import { InternalServerErrorException } from '@nestjs/common';
import { AuditAction } from '@modules/audit/domain/audit-action.entity';
import { QUEUES } from '@infrastructure/queue/queue.constants';
import {
  AUDIT_ACTION_CODES,
  AUDIT_ENTITY_TYPES,
} from '../interfaces/audit.constants';
import { SECURITY_EVENT_CODES } from '@modules/auth/interfaces/security.constants';

describe('AuditService', () => {
  let service: AuditService;
  let auditLogRepository: Partial<AuditLogRepository>;
  let auditActionRepository: Partial<AuditActionRepository>;
  let securityEventRepository: Partial<SecurityEventRepository>;
  let auditQueue: Partial<Queue>;

  const mockAuditAction = {
    id: '1',
    code: AUDIT_ACTION_CODES.FILE_UPLOAD,
    name: 'File Upload',
  } as AuditAction;

  beforeEach(async () => {
    auditLogRepository = {
      create: jest
        .fn()
        .mockImplementation((dto) => Promise.resolve({ id: 'log-1', ...dto })),
      findAll: jest.fn().mockResolvedValue([]),
    };

    auditActionRepository = {
      findByCode: jest.fn().mockResolvedValue(mockAuditAction),
    };

    securityEventRepository = {
      findAll: jest.fn().mockResolvedValue([]),
    };

    auditQueue = {
      getJobSchedulers: jest.fn().mockResolvedValue([]),
      add: jest.fn().mockResolvedValue({}),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuditService,
        { provide: AuditLogRepository, useValue: auditLogRepository },
        { provide: AuditActionRepository, useValue: auditActionRepository },
        { provide: SecurityEventRepository, useValue: securityEventRepository },
        { provide: getQueueToken(QUEUES.AUDIT), useValue: auditQueue },
      ],
    }).compile();

    service = module.get<AuditService>(AuditService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('logAction', () => {
    it('should create an audit log successfully', async () => {
      const result = await service.logAction(
        'user-1',
        AUDIT_ACTION_CODES.FILE_UPLOAD,
        AUDIT_ENTITY_TYPES.MATERIAL,
        '123',
      );

      expect(auditActionRepository.findByCode).toHaveBeenCalledWith(
        AUDIT_ACTION_CODES.FILE_UPLOAD,
        undefined,
      );
      expect(auditLogRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 'user-1',
          auditActionId: '1',
          entityType: AUDIT_ENTITY_TYPES.MATERIAL,
          entityId: '123',
        }),
        undefined,
      );
      expect(result).toBeDefined();
    });

    it('should throw InternalServerErrorException if action code does not exist', async () => {
      (auditActionRepository.findByCode as jest.Mock).mockResolvedValue(null);

      await expect(
        service.logAction('user-1', 'INVALID_ACTION'),
      ).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('getUnifiedHistory', () => {
    it('should merge and sort events from both sources', async () => {
      const now = new Date();
      const past = new Date(now.getTime() - 1000);

      const mockSecurityEvents = [
        {
          id: 'sec-1',
          eventDatetime: now,
          userId: 'u1',
          user: { firstName: 'Admin' },
          securityEventType: {
            code: SECURITY_EVENT_CODES.LOGIN_SUCCESS,
            name: 'Login',
          },
          ipAddress: '127.0.0.1',
        },
      ];

      const mockAuditLogs = [
        {
          id: 'aud-1',
          eventDatetime: past,
          userId: 'u1',
          user: { firstName: 'Admin' },
          auditAction: { code: AUDIT_ACTION_CODES.FILE_UPLOAD, name: 'Upload' },
          entityType: AUDIT_ENTITY_TYPES.MATERIAL,
          entityId: 'f1',
        },
      ];

      (securityEventRepository.findAll as jest.Mock).mockResolvedValue(
        mockSecurityEvents,
      );
      (auditLogRepository.findAll as jest.Mock).mockResolvedValue(
        mockAuditLogs,
      );

      const result = await service.getUnifiedHistory({});

      expect(result).toHaveLength(2);
      expect(result[0].source).toBe('SECURITY');
      expect(result[1].source).toBe('AUDIT');
      expect(result[0].datetime.getTime()).toBeGreaterThan(
        result[1].datetime.getTime(),
      );
    });
  });
});
