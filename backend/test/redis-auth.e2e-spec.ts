import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import { RedisCacheService } from './../src/infrastructure/cache/redis-cache.service';
import { SessionValidatorService } from './../src/modules/auth/application/session-validator.service';
import { TestSeeder } from './e2e/test-utils';
import { DataSource } from 'typeorm';

interface JwtPayload {
  sessionId: string;
}

describe('Redis Auth Security & Performance (E2E)', () => {
  let app: INestApplication;
  let redisService: RedisCacheService;
  let sessionValidator: SessionValidatorService;
  let jwtService: JwtService;
  let dataSource: DataSource;
  let seeder: TestSeeder;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api/v1');
    
    redisService = app.get(RedisCacheService);
    sessionValidator = app.get(SessionValidatorService);
    jwtService = app.get(JwtService);
    dataSource = app.get(DataSource);
    seeder = new TestSeeder(dataSource, app);

    await app.init();
  });

  afterAll(async () => {
    if (app) await app.close();
  });

  let token: string;
  let sessionId: string;

  it('STEP 1: Debe crear una sesión y generar caché al loguearse (Simulado)', async () => {
    const auth = await seeder.createAuthenticatedUser(
      TestSeeder.generateUniqueEmail('redis'),
      ['STUDENT'],
    );
    token = auth.token;

    const payload = jwtService.decode(token) as JwtPayload;
    sessionId = payload.sessionId;

    expect(sessionId).toBeDefined();
  });

  it('STEP 2: [PERFORMANCE] Primera petición debe ser Cache Miss (Hit DB) y guardar en Redis', async () => {
    const validatorSpy = jest.spyOn(sessionValidator, 'validateSession');
    const redisSetSpy = jest.spyOn(redisService, 'set');

    await request(app.getHttpServer())
      .get('/api/v1/enrollments/my-courses')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(validatorSpy).toHaveBeenCalled();
    expect(redisSetSpy).toHaveBeenCalledWith(
      expect.stringContaining(`cache:session:${sessionId}:user`),
      expect.anything(),
      expect.anything(),
    );

    validatorSpy.mockRestore();
    redisSetSpy.mockRestore();
  });

  it('STEP 3: [PERFORMANCE] Segunda petición debe ser Cache Hit (CERO DB CALLS)', async () => {
    const validatorSpy = jest.spyOn(sessionValidator, 'validateSession');

    await request(app.getHttpServer())
      .get('/api/v1/enrollments/my-courses')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(validatorSpy).not.toHaveBeenCalled();

    validatorSpy.mockRestore();
  });

  it('STEP 4: [SECURITY] Logout debe invalidar el token inmediatamente (Borrar caché)', async () => {
    const redisDelSpy = jest.spyOn(redisService, 'del');

    await request(app.getHttpServer())
      .post('/api/v1/auth/logout')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(redisDelSpy).toHaveBeenCalledWith(`cache:session:${sessionId}:user`);

    await request(app.getHttpServer())
      .get('/api/v1/enrollments/my-courses')
      .set('Authorization', `Bearer ${token}`)
      .expect(401);

    redisDelSpy.mockRestore();
  });
});