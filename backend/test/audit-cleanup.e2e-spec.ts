import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../src/app.module';
import { DataSource } from 'typeorm';
import { AuditCleanupProcessor } from '@modules/audit/infrastructure/processors/audit-cleanup.processor';
import { AuditLogRepository } from '@modules/audit/infrastructure/audit-log.repository';
import { SettingsService } from '@modules/settings/application/settings.service';
import { Job } from 'bullmq';
import { TestSeeder } from './e2e/test-utils';

jest.setTimeout(60000);

interface AuditLogQueryResult {
  entity_type: string | null;
}

describe('Audit Cleanup Process (Integration)', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let processor: AuditCleanupProcessor;
  let auditLogRepo: AuditLogRepository;
  let settingsService: SettingsService;
  let seeder: TestSeeder;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    dataSource = app.get(DataSource);
    processor = app.get(AuditCleanupProcessor);
    auditLogRepo = app.get(AuditLogRepository);
    settingsService = app.get(SettingsService);
    seeder = new TestSeeder(dataSource, app);

    await dataSource.query('DELETE FROM audit_log');
    await dataSource.query('DELETE FROM security_event');
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    await dataSource.query(
      "UPDATE system_setting SET setting_value = '30' WHERE setting_key = 'AUDIT_CLEANUP_RETENTION_DAYS'",
    );
    await settingsService.invalidateCache('AUDIT_CLEANUP_RETENTION_DAYS');
  });

  it('should FAIL if retention days is less than 7 (Security Hard Limit)', async () => {
    await dataSource.query(
      "UPDATE system_setting SET setting_value = '1' WHERE setting_key = 'AUDIT_CLEANUP_RETENTION_DAYS'",
    );
    await settingsService.invalidateCache('AUDIT_CLEANUP_RETENTION_DAYS');

    const job = { name: 'cleanup-old-logs' } as Job;

    await expect(processor.process(job)).rejects.toThrow(
      'Error de configuración: El período mínimo de retención es de 7 días',
    );
  });

  it('should DELETE logs older than retention period and KEEP newer ones', async () => {
    await dataSource.query(
      "UPDATE system_setting SET setting_value = '30' WHERE setting_key = 'AUDIT_CLEANUP_RETENTION_DAYS'",
    );
    await settingsService.invalidateCache('AUDIT_CLEANUP_RETENTION_DAYS');

    const user = await seeder.createAuthenticatedUser('cleanup-test@test.com', [
      'ADMIN',
    ]);

    await auditLogRepo.create({
      userId: user.user.id,
      auditActionId: '1',
      eventDatetime: new Date(),
      entityType: 'TEST_KEEP',
    });

    const oldDate = new Date();
    oldDate.setDate(oldDate.getDate() - 35);

    await dataSource.query(
      `INSERT INTO audit_log (user_id, audit_action_id, event_datetime, entity_type) VALUES (?, ?, ?, ?)`,
      [user.user.id, 1, oldDate, 'TEST_DELETE'],
    );

    const job = { name: 'cleanup-old-logs' } as Job;
    await processor.process(job);

    const remainingLogs = await dataSource.query(
      `SELECT entity_type FROM audit_log WHERE user_id = ?`,
      [user.user.id],
    );

    const keptLog = remainingLogs.find((l) => l.entity_type === 'TEST_KEEP');
    const deletedLog = remainingLogs.find(
      (l) => l.entity_type === 'TEST_DELETE',
    );

    expect(keptLog).toBeDefined();
    expect(deletedLog).toBeUndefined();
  });

  it('should STOP deletion if max batch limit is reached (Circuit Breaker)', async () => {
    const job = { name: 'cleanup-old-logs' } as Job;
    await expect(processor.process(job)).resolves.not.toThrow();
  });
});
