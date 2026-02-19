import { DataSource } from 'typeorm';
import { INestApplication } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AcademicCycle } from '@modules/cycles/domain/academic-cycle.entity';
import { Course } from '@modules/courses/domain/course.entity';
import { CourseCycle } from '@modules/courses/domain/course-cycle.entity';
import { Evaluation } from '@modules/evaluations/domain/evaluation.entity';
import { User, PhotoSource } from '@modules/users/domain/user.entity';
import { Role } from '@modules/users/domain/role.entity';
import { RedisCacheService } from '@infrastructure/cache/redis-cache.service';
import {
  ENROLLMENT_STATUS_CODES,
  ENROLLMENT_TYPE_CODES,
} from '@modules/enrollments/domain/enrollment.constants';
import { EVALUATION_TYPE_CODES } from '@modules/evaluations/domain/evaluation.constants';
import {
  DELETION_REQUEST_STATUS_CODES,
  FOLDER_STATUS_CODES,
  MATERIAL_STATUS_CODES,
} from '@modules/materials/domain/material.constants';
import { SESSION_STATUS_CODES } from '@modules/auth/interfaces/security.constants';
import { ROLE_CODES } from '@common/constants/role-codes.constants';

interface BasicEntity {
  id: string;
  code: string;
}

interface CycleLevelEntity {
  id: string;
  levelNumber: number;
}

export class TestSeeder {
  private jwtService: JwtService;
  private cacheService: RedisCacheService;

  constructor(
    private dataSource: DataSource,
    private app: INestApplication,
  ) {
    this.jwtService = app.get(JwtService);
    this.cacheService = app.get(RedisCacheService);
  }

  private sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  static generateUniqueEmail(prefix: string): string {
    return `${prefix}_${Date.now()}_${Math.floor(Math.random() * 10000)}@test.com`;
  }

  async createCycle(
    code: string,
    start: string,
    end: string,
  ): Promise<AcademicCycle> {
    const repo = this.dataSource.getRepository(AcademicCycle);
    return await repo.save(
      repo.create({
        code,
        startDate: start,
        endDate: end,
        createdAt: new Date(),
      }),
    );
  }

  async createCourse(code: string, name: string): Promise<Course> {
    const typeRepo = this.dataSource.getRepository('CourseType');
    const levelRepo = this.dataSource.getRepository('CycleLevel');

    let type = (await typeRepo.findOne({
      where: { code: 'REG' },
    })) as BasicEntity | null;
    if (!type)
      type = (await typeRepo.save(
        typeRepo.create({ code: 'REG', name: 'Regular' }),
      )) as BasicEntity;

    let level = (await levelRepo.findOne({
      where: { levelNumber: 1 },
    })) as CycleLevelEntity | null;
    if (!level)
      level = (await levelRepo.save(
        levelRepo.create({ levelNumber: 1, name: 'L1' }),
      )) as CycleLevelEntity;

    const repo = this.dataSource.getRepository(Course);
    return await repo.save(
      repo.create({
        code,
        name,
        courseTypeId: type.id,
        cycleLevelId: level.id,
        createdAt: new Date(),
      }),
    );
  }

  async linkCourseCycle(
    courseId: string,
    cycleId: string,
  ): Promise<CourseCycle> {
    const repo = this.dataSource.getRepository(CourseCycle);
    const existing = await repo.findOne({
      where: { courseId, academicCycleId: cycleId },
    });
    if (existing) return existing;

    const courseCycle = await repo.save(
      repo.create({
        courseId,
        academicCycleId: cycleId,
      }),
    );

    const evalRepo = this.dataSource.getRepository(Evaluation);
    const typeRepo = this.dataSource.getRepository('EvaluationType');

    let bankType = (await typeRepo.findOne({
      where: { code: EVALUATION_TYPE_CODES.BANCO_ENUNCIADOS },
    })) as BasicEntity | null;
    if (!bankType)
      bankType = (await typeRepo.save(
        typeRepo.create({
          code: EVALUATION_TYPE_CODES.BANCO_ENUNCIADOS,
          name: 'Banco',
        }),
      )) as BasicEntity;

    const cycle = await this.dataSource
      .getRepository(AcademicCycle)
      .findOne({ where: { id: cycleId } });

    if (cycle) {
      await evalRepo.save(
        evalRepo.create({
          courseCycleId: courseCycle.id,
          evaluationTypeId: bankType.id,
          number: 0,
          startDate: cycle.startDate,
          endDate: cycle.endDate,
        }),
      );
    }

    const typeRepoEnroll = this.dataSource.getRepository('EnrollmentType');
    const types = [
      { code: ENROLLMENT_TYPE_CODES.FULL, name: 'Curso Completo' },
      { code: ENROLLMENT_TYPE_CODES.PARTIAL, name: 'Por Evaluación' },
    ];
    for (const t of types) {
      const exists = await typeRepoEnroll.findOne({ where: { code: t.code } });
      if (!exists) {
        await typeRepoEnroll.save(typeRepoEnroll.create(t));
      }
    }

    const statusRepo = this.dataSource.getRepository('EnrollmentStatus');
    const activeStatus = await statusRepo.findOne({
      where: { code: ENROLLMENT_STATUS_CODES.ACTIVE },
    });
    if (!activeStatus) {
      await statusRepo.save(
        statusRepo.create({
          code: ENROLLMENT_STATUS_CODES.ACTIVE,
          name: 'Matrícula Activa',
        }),
      );
    }

    return courseCycle;
  }

  async ensureMaterialStatuses() {
    const fsRepo = this.dataSource.getRepository('FolderStatus');
    const msRepo = this.dataSource.getRepository('MaterialStatus');
    const drsRepo = this.dataSource.getRepository('DeletionRequestStatus');

    if (
      !(await fsRepo.findOne({ where: { code: FOLDER_STATUS_CODES.ACTIVE } }))
    )
      await fsRepo.save(
        fsRepo.create({ code: FOLDER_STATUS_CODES.ACTIVE, name: 'Activa' }),
      );

    if (
      !(await msRepo.findOne({ where: { code: MATERIAL_STATUS_CODES.ACTIVE } }))
    )
      await msRepo.save(
        msRepo.create({ code: MATERIAL_STATUS_CODES.ACTIVE, name: 'Activo' }),
      );

    if (
      !(await drsRepo.findOne({
        where: { code: DELETION_REQUEST_STATUS_CODES.PENDING },
      }))
    )
      await drsRepo.save(
        drsRepo.create({
          code: DELETION_REQUEST_STATUS_CODES.PENDING,
          name: 'Pendiente',
        }),
      );
  }

  async createEvaluation(
    courseCycleId: string,
    typeCode: string,
    number: number,
    start: string,
    end: string,
  ): Promise<Evaluation> {
    const typeRepo = this.dataSource.getRepository('EvaluationType');
    let type = (await typeRepo.findOne({
      where: { code: typeCode },
    })) as BasicEntity | null;
    if (!type)
      type = (await typeRepo.save(
        typeRepo.create({ code: typeCode, name: typeCode }),
      )) as BasicEntity;

    const repo = this.dataSource.getRepository(Evaluation);
    const evaluation = repo.create({
      courseCycleId,
      evaluationTypeId: type.id,
      number,
      startDate: start,
      endDate: end,
    });
    return await repo.save(evaluation);
  }

  async createAuthenticatedUser(
    email: string,
    roles: string[] = [ROLE_CODES.STUDENT],
  ): Promise<{ user: User; token: string }> {
    const userRepo = this.dataSource.getRepository(User);
    const roleRepo = this.dataSource.getRepository(Role);

    let user = await userRepo.findOne({
      where: { email },
      relations: { roles: true },
    });

    if (!user) {
      user = await userRepo.save(
        userRepo.create({
          email,
          firstName: 'Test',
          photoSource: PhotoSource.NONE,
          createdAt: new Date(),
        }),
      );
    }

    await this.dataSource.query('DELETE FROM user_role WHERE user_id = ?', [
      user.id,
    ]);

    const userRoles: Role[] = [];
    for (const roleCode of roles) {
      let role = await roleRepo.findOne({ where: { code: roleCode } });
      if (!role) {
        role = await roleRepo.save(
          roleRepo.create({ code: roleCode, name: roleCode }),
        );
      }
      userRoles.push(role);
    }
    user.roles = userRoles;
    await userRepo.save(user);

    await this.sleep(50);

    const statusRepo = this.dataSource.getRepository('SessionStatus');
    let activeStatus = (await statusRepo.findOne({
      where: { code: SESSION_STATUS_CODES.ACTIVE },
    })) as BasicEntity | null;
    if (!activeStatus)
      activeStatus = (await statusRepo.save(
        statusRepo.create({
          code: SESSION_STATUS_CODES.ACTIVE,
          name: 'Active',
        }),
      )) as BasicEntity;

    const deviceId = 'device-' + Date.now();
    const sessionRepo = this.dataSource.getRepository('UserSession');
    const session = (await sessionRepo.save(
      sessionRepo.create({
        userId: user.id,
        deviceId,
        ipAddress: '127.0.0.1',
        refreshTokenHash: 'hash-' + Date.now(),
        refreshTokenJti: 'jti-' + Date.now(),
        sessionStatusId: activeStatus.id,
        isActive: true,
        expiresAt: new Date(Date.now() + 1000 * 60 * 60),
        lastActivityAt: new Date(),
        createdAt: new Date(),
      }),
    )) as { id: string };

    await this.cacheService.del(`cache:session:${session.id}:user`);
    await this.cacheService.invalidateGroup(`cache:access:user:${user.id}:*`);

    const payload = {
      sub: user.id,
      email: user.email,
      roles: roles,
      activeRole: roles[0],
      sessionId: session.id,
      deviceId,
    };

    const token = this.jwtService.sign(payload);
    user.roles = userRoles;

    return { user, token };
  }

  async createUser(email: string): Promise<User> {
    const repo = this.dataSource.getRepository(User);
    let user = await repo.findOne({ where: { email } });
    if (!user) {
      user = await repo.save(
        repo.create({
          email,
          firstName: 'Test',
          photoSource: PhotoSource.NONE,
          createdAt: new Date(),
        }),
      );
    }
    return user;
  }
}
