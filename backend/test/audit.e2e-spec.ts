import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { DataSource } from 'typeorm';
import { HttpAdapterHost, Reflector } from '@nestjs/core';
import { AllExceptionsFilter } from '../src/common/filters/all-exceptions.filter';
import { TransformInterceptor } from '../src/common/interceptors/transform.interceptor';
import { TestSeeder } from './e2e/test-utils';

jest.setTimeout(60000);

describe('AuditController (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let seeder: TestSeeder;
  let accessToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    app.setGlobalPrefix('api/v1');
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    const httpAdapterHost = app.get(HttpAdapterHost);
    const reflector = app.get(Reflector);
    app.useGlobalFilters(new AllExceptionsFilter(httpAdapterHost));
    app.useGlobalInterceptors(new TransformInterceptor(reflector));

    await app.init();

    dataSource = app.get(DataSource);
    seeder = new TestSeeder(dataSource, app);

    // Crear un usuario ADMIN real con sesión activa en DB
    const auth = await seeder.createAuthenticatedUser('admin-audit@test.com', [
      'ADMIN',
    ]);
    accessToken = auth.token;
  });

  afterAll(async () => {
    await app.close();
  });

  it('/audit/history (GET) - should return 401 without token', () => {
    return request(app.getHttpServer())
      .get('/api/v1/audit/history')
      .expect(401);
  });

  it('/audit/history (GET) - should return history list with valid token', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/v1/audit/history')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(response.body.statusCode).toBe(200);
    expect(Array.isArray(response.body.data)).toBe(true);
  });

  it('/audit/history (GET) - should filter by date', async () => {
    const startDate = new Date().toISOString();
    await request(app.getHttpServer())
      .get(`/api/v1/audit/history?startDate=${startDate}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);
  });

  it('/audit/export (GET) - should return an excel file', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/v1/audit/export')
      .set('Authorization', `Bearer ${accessToken}`)
      .buffer()
      .parse((res, callback) => {
        res.setEncoding('binary');
        let data = '';
        res.on('data', (chunk) => {
          data += chunk;
        });
        res.on('end', () => {
          callback(null, Buffer.from(data, 'binary'));
        });
      })
      .expect(200);

    expect(response.header['content-type']).toBe(
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    expect(response.header['content-disposition']).toContain(
      'attachment; filename=reporte-auditoria',
    );
    expect(Buffer.isBuffer(response.body)).toBe(true);
    expect(response.body.length).toBeGreaterThan(0);
  });
});
