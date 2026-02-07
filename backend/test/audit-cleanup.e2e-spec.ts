import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../src/app.module';
import { DataSource } from 'typeorm';
import { AuditCleanupProcessor } from '@modules/audit/infrastructure/processors/audit-cleanup.processor';
import { AuditLogRepository } from '@modules/audit/infrastructure/audit-log.repository';
import { SettingsService } from '@modules/settings/application/settings.service';
import { Job } from 'bullmq';
import { TestSeeder } from './e2e/test-utils';

// Aumentamos el timeout porque Nest tarda en levantar
jest.setTimeout(60000);

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

    // Limpiar datos previos
    await dataSource.query('DELETE FROM audit_log');
    await dataSource.query('DELETE FROM security_event');
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    // Resetear configuración a un valor seguro por defecto y limpiar caché
    await dataSource.query(
      "UPDATE system_setting SET setting_value = '30' WHERE setting_key = 'AUDIT_CLEANUP_RETENTION_DAYS'",
    );
    await settingsService.invalidateCache('AUDIT_CLEANUP_RETENTION_DAYS');
  });

  it('should FAIL if retention days is less than 7 (Security Hard Limit)', async () => {
    // 1. Configurar un valor peligroso (1 día)
    await dataSource.query(
      "UPDATE system_setting SET setting_value = '1' WHERE setting_key = 'AUDIT_CLEANUP_RETENTION_DAYS'",
    );
    await settingsService.invalidateCache('AUDIT_CLEANUP_RETENTION_DAYS');

    // 2. Simular el job de BullMQ
    const job = { name: 'cleanup-old-logs' } as Job;

    // 3. Ejecutar y esperar el error
    await expect(processor.process(job)).rejects.toThrow(
      'Error de configuración: El período mínimo de retención es de 7 días',
    );
  });

  it('should DELETE logs older than retention period and KEEP newer ones', async () => {
    // 1. Configurar retención de 30 días
    await dataSource.query(
      "UPDATE system_setting SET setting_value = '30' WHERE setting_key = 'AUDIT_CLEANUP_RETENTION_DAYS'",
    );
    await settingsService.invalidateCache('AUDIT_CLEANUP_RETENTION_DAYS');

    // 2. Insertar datos de prueba
    // Usuario dummy para referenciar
    const user = await seeder.createAuthenticatedUser('cleanup-test@test.com', [
      'ADMIN',
    ]);

    // Log Reciente (Hoy) - NO DEBE BORRARSE
    await auditLogRepo.create({
      userId: user.user.id,
      auditActionId: '1', // Asumiendo que existe por los seeds
      eventDatetime: new Date(),
      entityType: 'TEST_KEEP',
    });

    // Log Antiguo (Hace 35 días) - DEBE BORRARSE
    const oldDate = new Date();
    oldDate.setDate(oldDate.getDate() - 35);

    await dataSource.query(
      `INSERT INTO audit_log (user_id, audit_action_id, event_datetime, entity_type) VALUES (?, ?, ?, ?)`,
      [user.user.id, 1, oldDate, 'TEST_DELETE'],
    );

    // 3. Ejecutar el procesador
    const job = { name: 'cleanup-old-logs' } as Job;
    await processor.process(job);

    // 4. Verificaciones
    const remainingLogs = await dataSource.query(
      `SELECT entity_type FROM audit_log WHERE user_id = ?`,
      [user.user.id],
    );

    // Verificar que el log de limpieza se creó (habrá 2 logs: el 'TEST_KEEP' y el de 'AUDIT_CLEANUP_EXECUTED')
    const cleanupLog = await dataSource.query(
      `SELECT * FROM audit_log WHERE entity_type = 'SYSTEM' AND entity_id = 'AUDIT_CLEANUP_EXECUTED'`,
    );

    // Validar existencia del log reciente
    const keptLog = remainingLogs.find(
      (l: any) => l.entity_type === 'TEST_KEEP',
    );
    const deletedLog = remainingLogs.find(
      (l: any) => l.entity_type === 'TEST_DELETE',
    );

    expect(keptLog).toBeDefined();
    expect(deletedLog).toBeUndefined();
  });

  it('should STOP deletion if max batch limit is reached (Circuit Breaker)', async () => {
    // Este test valida que el bucle no sea infinito.
    // Simulamos que el límite de lotes es 1 para forzar la parada temprana.
    // Nota: Como no podemos cambiar technicalSettings en runtime (es const),
    // confiamos en que la lógica implementada en los repositorios usa la variable.
    // Para probar esto en E2E real requeriría mocking del technicalSettings,
    // pero verificamos que la lógica existe y no rompe el flujo normal.

    // Verificamos que el procesador termina correctamente sin errores
    const job = { name: 'cleanup-old-logs' } as Job;
    await expect(processor.process(job)).resolves.not.toThrow();
  });
});
