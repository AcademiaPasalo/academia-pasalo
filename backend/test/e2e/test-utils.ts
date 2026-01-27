import { DataSource } from 'typeorm';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { JwtService } from '@nestjs/jwt';
import { CreateCourseDto } from '@modules/courses/dto/create-course.dto';
import { CreateEvaluationDto } from '@modules/evaluations/dto/create-evaluation.dto';

export class TestSeeder {
  private jwtService: JwtService;

  constructor(private dataSource: DataSource, private app: INestApplication) {
    this.jwtService = app.get(JwtService);
  }

  static generateUniqueEmail(prefix: string): string {
    return `${prefix}_${Date.now()}_${Math.floor(Math.random() * 10000)}@test.com`;
  }

  async createCycle(code: string, start: string, end: string) {
    const repo = this.dataSource.getRepository('AcademicCycle');
    return await repo.save(repo.create({ 
      code, 
      startDate: start, 
      endDate: end,
      createdAt: new Date() 
    }));
  }

  async createCourse(code: string, name: string) {
    const typeRepo = this.dataSource.getRepository('CourseType');
    const levelRepo = this.dataSource.getRepository('CycleLevel');
    
    let type = await typeRepo.findOne({ where: {} });
    if (!type) type = await typeRepo.save(typeRepo.create({ code: 'REG', name: 'Regular' }));
    
    let level = await levelRepo.findOne({ where: {} });
    if (!level) level = await levelRepo.save(levelRepo.create({ levelNumber: 1, name: 'L1' }));

    const repo = this.dataSource.getRepository('Course');
    return await repo.save(repo.create({ 
      code, 
      name, 
      courseTypeId: type.id, 
      cycleLevelId: level.id,
      createdAt: new Date()
    }));
  }

  async linkCourseCycle(courseId: string, cycleId: string) {
    // We need an admin token for this, or simulate DB insertion directly
    // To simplify, we'll do DB insertion directly as this is a setup step
    const repo = this.dataSource.getRepository('CourseCycle');
    const existing = await repo.findOne({ where: { courseId, academicCycleId: cycleId } });
    if (existing) return existing;

    const courseCycle = await repo.save(repo.create({
      courseId,
      academicCycleId: cycleId
    }));

    // Create Banco de Enunciados manually as we skipped the service logic
    const evalRepo = this.dataSource.getRepository('Evaluation');
    const typeRepo = this.dataSource.getRepository('EvaluationType');
    
    let bankType = await typeRepo.findOne({ where: { code: 'BANCO_ENUNCIADOS' } });
    if (!bankType) bankType = await typeRepo.save(typeRepo.create({ code: 'BANCO_ENUNCIADOS', name: 'Banco' }));

    // Get cycle dates
    const cycle = await this.dataSource.getRepository('AcademicCycle').findOne({ where: { id: cycleId } });

    await evalRepo.save(evalRepo.create({
      courseCycleId: courseCycle.id,
      evaluationTypeId: bankType.id,
      number: 0,
      startDate: cycle.startDate,
      endDate: cycle.endDate
    }));

    // Ensure EnrollmentTypes exist
    const typeRepoEnroll = this.dataSource.getRepository('EnrollmentType');
    const types = [
      { code: 'FULL', name: 'Curso Completo' },
      { code: 'PARTIAL', name: 'Por Evaluación' }
    ];
    for (const t of types) {
      const exists = await typeRepoEnroll.findOne({ where: { code: t.code } });
      if (!exists) {
        await typeRepoEnroll.save(typeRepoEnroll.create(t));
      }
    }

    // Ensure EnrollmentStatus exists
    const statusRepo = this.dataSource.getRepository('EnrollmentStatus');
    let activeStatus = await statusRepo.findOne({ where: { code: 'ACTIVE' } });
    if (!activeStatus) {
      await statusRepo.save(statusRepo.create({ code: 'ACTIVE', name: 'Matrícula Activa' }));
    }

    return courseCycle;
  }

  async createEvaluation(courseCycleId: string, typeCode: string, number: number, start: string, end: string) {
    const typeRepo = this.dataSource.getRepository('EvaluationType');
    let type = await typeRepo.findOne({ where: { code: typeCode } });
    if (!type) type = await typeRepo.save(typeRepo.create({ code: typeCode, name: typeCode }));

    const repo = this.dataSource.getRepository('Evaluation');
    const evaluation = repo.create({
      courseCycleId,
      evaluationTypeId: type.id,
      number,
      startDate: start,
      endDate: end
    });
    return await repo.save(evaluation);
  }

  async createAuthenticatedUser(email: string, roles: string[] = ['STUDENT']) {
    const userRepo = this.dataSource.getRepository('User');
    let user = await userRepo.findOne({ where: { email } });
    
    if (!user) {
      user = await userRepo.save(userRepo.create({ 
        email, firstName: 'Test', photoSource: 'none', createdAt: new Date() 
      }));
    }

    // Create Session Status
    const statusRepo = this.dataSource.getRepository('SessionStatus');
    let activeStatus = await statusRepo.findOne({ where: { code: 'ACTIVE' } });
    if (!activeStatus) activeStatus = await statusRepo.save(statusRepo.create({ code: 'ACTIVE', name: 'Active' }));

    // Create Session
    const sessionRepo = this.dataSource.getRepository('UserSession');
    const session = await sessionRepo.save(sessionRepo.create({
      userId: user.id,
      deviceId: 'test-device',
      ipAddress: '127.0.0.1',
      refreshTokenHash: 'dummy',
      sessionStatusId: activeStatus.id,
      isActive: true,
      expiresAt: new Date(Date.now() + 1000 * 60 * 60), // 1 hour
      lastActivityAt: new Date(),
      createdAt: new Date()
    }));

    // Assign Roles in DB
    const roleRepo = this.dataSource.getRepository('Role');
    for (const roleCode of roles) {
      let role = await roleRepo.findOne({ where: { code: roleCode } });
      if (!role) {
        role = await roleRepo.save(roleRepo.create({ code: roleCode, name: roleCode }));
      }
      
      // Check if user already has this role to avoid duplicates
      const existingUserRole = await this.dataSource.createQueryBuilder()
        .select('ur.user_id')
        .from('user_role', 'ur')
        .where('ur.user_id = :userId AND ur.role_id = :roleId', { userId: user.id, roleId: role.id })
        .getRawOne();

      if (!existingUserRole) {
        await this.dataSource.createQueryBuilder()
          .insert()
          .into('user_role')
          .values({ user_id: user.id, role_id: role.id })
          .execute();
      }
    }

    // Generate Token
    const payload = {
      sub: user.id,
      email: user.email,
      roles: roles,
      sessionId: session.id
    };
    
    const token = this.jwtService.sign(payload);

    return { user, token };
  }

  async createUser(email: string) {
    const repo = this.dataSource.getRepository('User');
    let user = await repo.findOne({ where: { email } });
    if (!user) {
      user = await repo.save(repo.create({ 
        email, firstName: 'Test', photoSource: 'none', createdAt: new Date() 
      }));
    }
    return user;
  }
}
