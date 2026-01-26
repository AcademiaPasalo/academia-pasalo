import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { RedisCacheService } from '../src/infrastructure/cache/redis-cache.service';
import { UserSessionRepository } from '../src/modules/auth/infrastructure/user-session.repository';
import { DataSource } from 'typeorm';
import { JwtService } from '@nestjs/jwt';

describe('Redis Auth Security & Performance (E2E)', () => {
  let app: INestApplication;
  let redisService: RedisCacheService;
  let sessionRepository: UserSessionRepository;
  let jwtService: JwtService;
  let dataSource: DataSource;
  let authToken: string;
  let sessionId: string;
  let userId: string;

  // Datos de prueba
  const mockUserEmail = 'test_redis_perf@academia.com';

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    
    // Configuración global igual a main.ts
    app.setGlobalPrefix('api/v1');
    
    await app.init();

    redisService = moduleFixture.get<RedisCacheService>(RedisCacheService);
    sessionRepository = moduleFixture.get<UserSessionRepository>(UserSessionRepository);
    dataSource = moduleFixture.get<DataSource>(DataSource);
    jwtService = moduleFixture.get<JwtService>(JwtService);

    // 1. Limpieza previa y creación de usuario seed (Manual SQL para velocidad)
    await dataSource.query(`DELETE FROM user_session WHERE user_id IN (SELECT id FROM user WHERE email = '${mockUserEmail}')`);
    await dataSource.query(`DELETE FROM user WHERE email = '${mockUserEmail}'`);
    
    const insertUser = await dataSource.query(`
      INSERT INTO user (email, first_name, last_name_1, last_name_2, profile_photo_url, photo_source, created_at)
      VALUES ('${mockUserEmail}', 'Redis', 'Tester', 'Automated', 'http://img.com', 'none', NOW())
    `);
    
    // MySQL retorna insertId en header, obtenemos el ID así:
    const user = await dataSource.query(`SELECT id FROM user WHERE email = '${mockUserEmail}'`);
    userId = user[0].id;
    
    // Asignar rol STUDENT (asumiendo que ID 2 es STUDENT, ajusta si es necesario)
    await dataSource.query(`INSERT INTO user_role (user_id, role_id) VALUES (${userId}, 2)`);
  });

  afterAll(async () => {
    // Limpieza final
    if (userId) {
       await dataSource.query(`DELETE FROM user_session WHERE user_id = ${userId}`);
       await dataSource.query(`DELETE FROM user_role WHERE user_id = ${userId}`);
       await dataSource.query(`DELETE FROM user WHERE id = ${userId}`);
    }
    await app.close();
  });

  it('STEP 1: Debe crear una sesión y generar caché al loguearse (Simulado)', async () => {
    // Simulamos un login manual creando sesión en BD para obtener token válido
    // No usamos el endpoint /google porque requiere un code real de Google.
    
    const refreshToken = jwtService.sign({ sub: userId, deviceId: 'test-device', type: 'refresh' }, { secret: process.env.JWT_SECRET });
    const expiresAt = new Date(Date.now() + 3600 * 1000);
    
    const insertSession = await dataSource.query(`
        INSERT INTO user_session (user_id, refresh_token_hash, device_id, ip_address, expires_at, is_active, session_status_id, last_activity_at, created_at)
        VALUES (${userId}, 'hash_simulado', 'test-device', '127.0.0.1', ?, 1, 1, NOW(), NOW())
    `, [expiresAt]);

    const sessionRaw = await dataSource.query(`SELECT id FROM user_session WHERE user_id = ${userId} ORDER BY id DESC LIMIT 1`);
    sessionId = sessionRaw[0].id;

    authToken = jwtService.sign({ 
        sub: userId, 
        email: mockUserEmail, 
        roles: ['STUDENT'], 
        sessionId: sessionId 
    }, { secret: process.env.JWT_SECRET });

    expect(authToken).toBeDefined();
    console.log('      Token generado manualmente para testing');
  });

  it('STEP 2: [PERFORMANCE] Primera petición debe ser Cache Miss (Hit DB) y guardar en Redis', async () => {
    // Espiamos el repositorio para asegurar que se llama a la BD
    const repoSpy = jest.spyOn(sessionRepository, 'findById');
    const redisSetSpy = jest.spyOn(redisService, 'set');

    // Hacemos una petición a un endpoint protegido (usamos /users/profile simulado o uno existente)
    // Usaremos users/:id como target, asumiendo que el usuario puede ver su propio perfil
    await request(app.getHttpServer())
      .get(`/api/v1/users/${userId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);

    // Verificaciones
    expect(repoSpy).toHaveBeenCalled(); // JwtStrategy llamó a la BD
    expect(redisSetSpy).toHaveBeenCalledWith(
        expect.stringContaining(`cache:session:${sessionId}:user`),
        expect.anything(),
        expect.any(Number)
    );
    
    // Verificar que la key existe físicamente en Redis
    const cachedValue = await redisService.get(`cache:session:${sessionId}:user`);
    expect(cachedValue).toBeDefined();
    console.log('      Cache Miss verificado: Se leyó de BD y se guardó en Redis');
    
    repoSpy.mockClear();
    redisSetSpy.mockClear();
  });

  it('STEP 3: [PERFORMANCE] Segunda petición debe ser Cache Hit (CERO DB CALLS)', async () => {
    const repoSpy = jest.spyOn(sessionRepository, 'findById');
    
    await request(app.getHttpServer())
      .get(`/api/v1/users/${userId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);

    // CRÍTICO: El repositorio NO debe haber sido llamado
    expect(repoSpy).not.toHaveBeenCalled();
    console.log('      Cache Hit verificado: CERO llamadas a la BD');
  });

  it('STEP 4: [SECURITY] Logout debe invalidar el token inmediatamente (Borrar caché)', async () => {
    // Ejecutamos Logout
    await request(app.getHttpServer())
      .post('/api/v1/auth/logout')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200); // OK

    // Verificamos que se borró de Redis
    const cachedValue = await redisService.get(`cache:session:${sessionId}:user`);
    expect(cachedValue).toBeNull();

    // Intentamos usar el mismo token -> Debe fallar
    await request(app.getHttpServer())
        .get(`/api/v1/users/${userId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(401);

    console.log('      Seguridad verificada: Token invalidado tras logout');
  });

  it('STEP 5: [SECURITY] Eliminación manual de caché (Simular Ban) bloquea acceso', async () => {
    // 1. Restaurar sesión (Login simulado de nuevo)
    await dataSource.query(`UPDATE user_session SET is_active = 1, session_status_id = 1 WHERE id = ${sessionId}`);
    
    // 2. Poblar caché (Hit inicial)
    await request(app.getHttpServer())
      .get(`/api/v1/users/${userId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);
    
    // 3. ADMIN BAN: Borramos caché manualmente y desactivamos en BD
    await redisService.del(`cache:session:${sessionId}:user`);
    await dataSource.query(`UPDATE user_session SET is_active = 0 WHERE id = ${sessionId}`);

    // 4. Intento de acceso
    await request(app.getHttpServer())
      .get(`/api/v1/users/${userId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .expect(401);
      
    console.log('      Ban Hammer verificado: Usuario bloqueado instantáneamente');
  });
});
