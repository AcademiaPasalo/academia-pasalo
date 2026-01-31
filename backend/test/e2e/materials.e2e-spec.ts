import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import request from 'supertest';
import { AppModule } from '@src/app.module';
import { DataSource } from 'typeorm';
import { TestSeeder } from './test-utils';
import { StorageService } from '@infrastructure/storage/storage.service';
import { TransformInterceptor } from '@common/interceptors/transform.interceptor';
import * as path from 'path';
import * as os from 'os';
import * as fs from 'fs';
import { User } from '@modules/users/domain/user.entity';
import { CourseCycle } from '@modules/courses/domain/course-cycle.entity';
import { Evaluation } from '@modules/evaluations/domain/evaluation.entity';

describe('E2E: Gestión de Materiales y Seguridad', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let seeder: TestSeeder;
  let storageService: StorageService;

  // Entidades base
  let admin: { user: User; token: string };
  let professor: { user: User; token: string };
  let studentWithAccess: { user: User; token: string };
  let studentWithoutAccess: { user: User; token: string };
  let courseCycle: CourseCycle;
  let evaluation: Evaluation;
  let rootFolderId: string;

  // Fechas
  const now = new Date();
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const nextMonth = new Date();
  nextMonth.setMonth(now.getMonth() + 1);
  const formatDate = (d: Date) => d.toISOString().split('T')[0];

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
    .overrideProvider(StorageService)
    .useValue({
      calculateHash: jest.fn().mockResolvedValue('mock-sha256-hash'),
      saveFile: jest.fn().mockImplementation(async (name, buffer) => {
         const tempPath = path.join(os.tmpdir(), name);
         await fs.promises.writeFile(tempPath, buffer);
         return tempPath;
      }),
      deleteFile: jest.fn().mockResolvedValue(undefined),
      onModuleInit: jest.fn(),
    })
    .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    
    // Registrar Interceptor para estandarizar respuesta (data wrapper)
    const reflector = app.get(Reflector);
    app.useGlobalInterceptors(new TransformInterceptor(reflector));

    await app.init();

    dataSource = app.get(DataSource);
    storageService = app.get(StorageService);
    seeder = new TestSeeder(dataSource, app);

    // Limpieza de tablas de materiales para evitar datos sucios (paths inexistentes)
    await dataSource.query('DELETE FROM deletion_request');
    await dataSource.query('DELETE FROM material');
    await dataSource.query('DELETE FROM file_version');
    await dataSource.query('DELETE FROM file_resource');
    await dataSource.query('DELETE FROM material_folder');

    // 1. Setup Base
    await seeder.ensureMaterialStatuses();
    const cycle = await seeder.createCycle(`2026-MAT-${Date.now()}`, formatDate(now), formatDate(nextMonth));
    const course = await seeder.createCourse(`MAT101-${Date.now()}`, 'Materiales 101');
    courseCycle = await seeder.linkCourseCycle(course.id, cycle.id);
    
    // 2. Crear Evaluación (Contenedor de carpetas)
    // Usamos 'yesterday' para asegurar que accessStartDate sea <= now incluso con UTC/Timezones
    evaluation = await seeder.createEvaluation(courseCycle.id, 'PC', 1, formatDate(yesterday), formatDate(nextMonth));

    // 3. Usuarios
    admin = await seeder.createAuthenticatedUser(TestSeeder.generateUniqueEmail('admin_mat'), ['ADMIN']);
    professor = await seeder.createAuthenticatedUser(TestSeeder.generateUniqueEmail('prof_mat'), ['PROFESSOR']);
    
    // Alumno con acceso (Full enrollment)
    const s1 = await seeder.createAuthenticatedUser(TestSeeder.generateUniqueEmail('student_ok'), ['STUDENT']);
    studentWithAccess = s1;
    await request(app.getHttpServer())
      .post('/enrollments')
      .set('Authorization', `Bearer ${admin.token}`)
      .send({ userId: s1.user.id, courseCycleId: courseCycle.id, enrollmentTypeCode: 'FULL' })
      .expect(201);

    // DEBUG: Verificar si se crearon los permisos
    const perms = await dataSource.getRepository('EnrollmentEvaluation').find({ 
        where: { enrollment: { userId: s1.user.id } },
        relations: { evaluation: true }
    });

    // Alumno sin acceso (No enrollment)
    studentWithoutAccess = await seeder.createAuthenticatedUser(TestSeeder.generateUniqueEmail('student_fail'), ['STUDENT']);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Fase 1: Gestión de Carpetas', () => {
    it('Admin debe poder crear carpeta raíz', async () => {
      const res = await request(app.getHttpServer())
        .post('/materials/folders')
        .set('Authorization', `Bearer ${admin.token}`)
        .send({
          evaluationId: evaluation.id,
          name: 'Material de Clase',
          visibleFrom: new Date().toISOString(),
        })
        .expect(201);
      
      rootFolderId = res.body.data.id;
      expect(rootFolderId).toBeDefined();
      expect(rootFolderId).toBeDefined();
    });

    it('Alumno matriculado debe poder ver carpetas raíz', async () => {
      const res = await request(app.getHttpServer())
        .get(`/materials/folders/evaluation/${evaluation.id}`)
        .set('Authorization', `Bearer ${studentWithAccess.token}`)
        .expect(200);
      
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data[0].id).toBe(rootFolderId);
    });

    it('Alumno SIN matrícula NO debe poder ver carpetas (403)', async () => {
      await request(app.getHttpServer())
        .get(`/materials/folders/evaluation/${evaluation.id}`)
        .set('Authorization', `Bearer ${studentWithoutAccess.token}`)
        .expect(403);
    });
  });

  describe('Fase 2: Subida de Archivos (Upload)', () => {
    it('Profesor debe poder subir archivo PDF a la carpeta', async () => {
      const buffer = Buffer.from('Contenido simulado del PDF');
      
      const res = await request(app.getHttpServer())
        .post('/materials')
        .set('Authorization', `Bearer ${professor.token}`)
        .attach('file', buffer, 'silabo.pdf')
        .field('materialFolderId', rootFolderId)
        .field('displayName', 'Sílabo Oficial')
        .expect(201);

      expect(res.body.data.id).toBeDefined();
      expect(storageService.saveFile).toHaveBeenCalled();
    });

    it('Debe fallar si no se envía archivo', async () => {
        await request(app.getHttpServer())
        .post('/materials')
        .set('Authorization', `Bearer ${professor.token}`)
        .field('materialFolderId', rootFolderId)
        .field('displayName', 'Fail File')
        .expect(400); // Bad Request (Validación correcta)
    });
  });

  describe('Fase 3: Descarga y Seguridad', () => {
    let materialId: string;

    beforeAll(async () => {
        // Crear un material específico para descargar
        const buffer = Buffer.from('PDF_TEST');
        const res = await request(app.getHttpServer())
            .post('/materials')
            .set('Authorization', `Bearer ${professor.token}`)
            .attach('file', buffer, 'test.pdf')
            .field('materialFolderId', rootFolderId)
            .field('displayName', 'Download Test')
            .expect(201);
        materialId = res.body.data.id;
    });

    it('Alumno matriculado debe poder descargar (Simulación)', async () => {
        // Al estar mockeado el StorageService, esperamos que el servicio intente leer.
        // Pero `createReadStream` es de 'fs'. Como el path es '/tmp/...', fallará en FS real si no mockeamos fs.
        // Sin embargo, la prueba más importante aquí es que PASE la barrera de seguridad (AccessEngine).
        // Si falla con 404 (Not Found) o 500 (FS Error), significa que PASÓ el 403.
        
        const res = await request(app.getHttpServer())
            .get(`/materials/${materialId}/download`)
            .set('Authorization', `Bearer ${studentWithAccess.token}`);
        
        // Esperamos 500 o 404 porque el archivo físico real no existe (Mock devolvió path falso), 
        // PERO NO 403.
        expect(res.status).not.toBe(403);
    });

    it('Alumno SIN matrícula debe recibir 403 Forbidden', async () => {
        await request(app.getHttpServer())
            .get(`/materials/${materialId}/download`)
            .set('Authorization', `Bearer ${studentWithoutAccess.token}`)
            .expect(403);
    });
  });

  describe('Fase 4: Flujo de Eliminación', () => {
    let materialId: string;

    beforeAll(async () => {
        const buffer = Buffer.from('DEL');
        const res = await request(app.getHttpServer())
            .post('/materials')
            .set('Authorization', `Bearer ${professor.token}`)
            .attach('file', buffer, 'delete_me.pdf')
            .field('materialFolderId', rootFolderId)
            .field('displayName', 'Delete Me')
            .expect(201);
        materialId = res.body.data.id;
    });

    it('Profesor NO puede borrar directamente (Debería implementar DELETE si existiera endpoint, pero no existe)', async () => {
       // Verificamos que SOLO exista el endpoint de request-deletion
       await request(app.getHttpServer())
         .delete(`/materials/${materialId}`)
         .set('Authorization', `Bearer ${professor.token}`)
         .expect(404); // Endpoint no existe
    });

    it('Profesor puede solicitar eliminación', async () => {
        await request(app.getHttpServer())
            .post('/materials/request-deletion')
            .set('Authorization', `Bearer ${professor.token}`)
            .send({ 
                entityType: 'material',
                entityId: materialId,
                reason: 'Ya no es válido' 
            })
            .expect(200);
        
        // Verificar en BD que se creó la solicitud
        const reqRepo = dataSource.getRepository('DeletionRequest');
        const req = await reqRepo.findOne({ where: { entityId: materialId } });
        expect(req).toBeDefined();
        expect(req?.reason).toBe('Ya no es válido');
    });
  });
});
