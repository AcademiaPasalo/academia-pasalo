import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import { RedisCacheService } from './../src/infrastructure/cache/redis-cache.service';
import { UserSessionRepository } from './../src/modules/auth/infrastructure/user-session.repository';
import { TestSeeder } from './e2e/test-utils';
import { DataSource } from 'typeorm';

describe('Redis Auth Security & Performance (E2E)', () => {
  let app: INestApplication;
  let redisService: RedisCacheService;
  let sessionRepository: UserSessionRepository;
  let jwtService: JwtService;
  let dataSource: DataSource;
  let seeder: TestSeeder;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    // IMPORTANTE: El prefijo debe coincidir con main.ts
    app.setGlobalPrefix('api/v1');
    await app.init();

    dataSource = app.get(DataSource);
    redisService = app.get(RedisCacheService);
    sessionRepository = app.get(UserSessionRepository);
    jwtService = app.get(JwtService);
    seeder = new TestSeeder(dataSource, app);

    // Limpieza inicial de Redis para evitar contaminación
    await redisService.invalidateGroup('*');
  });

  afterAll(async () => {
    await app.close();
  });

  let token: string;
  let sessionId: string;

  it('STEP 1: Debe crear una sesión y generar caché al loguearse (Simulado)', async () => {
    const auth = await seeder.createAuthenticatedUser(TestSeeder.generateUniqueEmail('redis'), ['STUDENT']);
    token = auth.token;

    // Decodificar el token para obtener el sessionId
    const payload = jwtService.decode(token) as any;
    sessionId = payload.sessionId;

    expect(sessionId).toBeDefined();
  });

  it('STEP 2: [PERFORMANCE] Primera petición debe ser Cache Miss (Hit DB) y guardar en Redis', async () => {
    const repoSpy = jest.spyOn(sessionRepository, 'findByIdWithUser');
    const redisSetSpy = jest.spyOn(redisService, 'set');

    await request(app.getHttpServer())
      .get('/api/v1/enrollments/my-courses')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(repoSpy).toHaveBeenCalled();
    expect(redisSetSpy).toHaveBeenCalledWith(
        expect.stringContaining(`cache:session:${sessionId}:user`),
        expect.anything(),
        expect.anything()
    );
    
    repoSpy.mockRestore();
    redisSetSpy.mockRestore();
  });

  it('STEP 3: [PERFORMANCE] Segunda petición debe ser Cache Hit (CERO DB CALLS)', async () => {
    const repoSpy = jest.spyOn(sessionRepository, 'findByIdWithUser');

    await request(app.getHttpServer())
      .get('/api/v1/enrollments/my-courses')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    // No debe llamar a la base de datos porque ya está en Redis
    expect(repoSpy).not.toHaveBeenCalled();
    
    repoSpy.mockRestore();
  });

  it('STEP 4: [SECURITY] Logout debe invalidar el token inmediatamente (Borrar caché)', async () => {
    const redisDelSpy = jest.spyOn(redisService, 'del');

    await request(app.getHttpServer())
      .post('/api/v1/auth/logout')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(redisDelSpy).toHaveBeenCalledWith(`cache:session:${sessionId}:user`);
    
    // La siguiente petición debe fallar (401) porque el caché fue borrado
    await request(app.getHttpServer())
      .get('/api/v1/enrollments/my-courses')
      .set('Authorization', `Bearer ${token}`)
      .expect(401);

    redisDelSpy.mockRestore();
  });
});
