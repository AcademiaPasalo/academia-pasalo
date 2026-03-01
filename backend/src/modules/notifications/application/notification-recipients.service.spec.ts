import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { InternalServerErrorException } from '@nestjs/common';
import { SelectQueryBuilder } from 'typeorm';
import { NotificationRecipientsService } from './notification-recipients.service';
import { ClassEvent } from '@modules/events/domain/class-event.entity';
import { ClassEventProfessor } from '@modules/events/domain/class-event-professor.entity';
import { Enrollment } from '@modules/enrollments/domain/enrollment.entity';
import { EnrollmentStatus } from '@modules/enrollments/domain/enrollment-status.entity';
import { Material } from '@modules/materials/domain/material.entity';
import { CourseCycleProfessor } from '@modules/courses/domain/course-cycle-professor.entity';
import { RedisCacheService } from '@infrastructure/cache/redis-cache.service';
import { ENROLLMENT_STATUS_CODES } from '@modules/enrollments/domain/enrollment.constants';

function makeQb(getRawOneResult: unknown, getRawManyResult: unknown[] = []) {
  const qb = {
    select: jest.fn().mockReturnThis(),
    addSelect: jest.fn().mockReturnThis(),
    innerJoin: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    getRawOne: jest.fn().mockResolvedValue(getRawOneResult),
    getRawMany: jest.fn().mockResolvedValue(getRawManyResult),
  };
  return qb as unknown as SelectQueryBuilder<unknown>;
}

const mockClassEventRepo = {
  createQueryBuilder: jest.fn(),
  findOne: jest.fn(),
};
const mockClassEventProfRepo = { createQueryBuilder: jest.fn() };
const mockEnrollmentRepo = { createQueryBuilder: jest.fn() };
const mockEnrollmentStatusRepo = { findOne: jest.fn() };
const mockMaterialRepo = { createQueryBuilder: jest.fn() };
const mockCourseCycleProfRepo = { createQueryBuilder: jest.fn() };
const mockCache = {
  get: jest.fn(),
  set: jest.fn(),
};

describe('NotificationRecipientsService', () => {
  let service: NotificationRecipientsService;

  const activeStatus = {
    id: 'status-active',
    code: ENROLLMENT_STATUS_CODES.ACTIVE,
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    mockCache.get.mockResolvedValue(null);
    mockCache.set.mockResolvedValue(undefined);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationRecipientsService,
        {
          provide: getRepositoryToken(ClassEvent),
          useValue: mockClassEventRepo,
        },
        {
          provide: getRepositoryToken(ClassEventProfessor),
          useValue: mockClassEventProfRepo,
        },
        {
          provide: getRepositoryToken(Enrollment),
          useValue: mockEnrollmentRepo,
        },
        {
          provide: getRepositoryToken(EnrollmentStatus),
          useValue: mockEnrollmentStatusRepo,
        },
        { provide: getRepositoryToken(Material), useValue: mockMaterialRepo },
        {
          provide: getRepositoryToken(CourseCycleProfessor),
          useValue: mockCourseCycleProfRepo,
        },
        { provide: RedisCacheService, useValue: mockCache },
      ],
    }).compile();

    service = module.get(NotificationRecipientsService);
    mockEnrollmentStatusRepo.findOne.mockResolvedValue(activeStatus);
  });

  describe('resolveClassEventContext', () => {
    const classRow = {
      classEventId: 'evt-1',
      classTitle: 'Clase de Álgebra',
      startDatetime: new Date('2026-03-01T14:00:00Z'),
      courseCycleId: 'cycle-1',
      courseName: 'Matemáticas',
    };

    it('devuelve el contexto con destinatarios fusionados sin duplicados', async () => {
      const ceQb = makeQb(classRow);
      mockClassEventRepo.createQueryBuilder.mockReturnValue(ceQb);

      const profQb = makeQb(null, [{ userId: 'u1' }, { userId: 'u2' }]);
      mockClassEventProfRepo.createQueryBuilder.mockReturnValue(profQb);

      const studQb = makeQb(null, [{ userId: 'u2' }, { userId: 'u3' }]);
      mockEnrollmentRepo.createQueryBuilder.mockReturnValue(studQb);

      const result = await service.resolveClassEventContext('evt-1');

      expect(result.classEventId).toBe('evt-1');
      expect(result.classTitle).toBe('Clase de Álgebra');
      expect(result.courseName).toBe('Matemáticas');
      expect(result.recipientUserIds).toHaveLength(3);
      expect(result.recipientUserIds).toEqual(
        expect.arrayContaining(['u1', 'u2', 'u3']),
      );
    });

    it('lanza InternalServerErrorException si el classEvent no existe', async () => {
      const ceQb = makeQb(null);
      mockClassEventRepo.createQueryBuilder.mockReturnValue(ceQb);

      await expect(
        service.resolveClassEventContext('evt-999'),
      ).rejects.toBeInstanceOf(InternalServerErrorException);
    });

    it('cachea el activeEnrollmentStatusId en llamadas sucesivas', async () => {
      const ceQb1 = makeQb(classRow);
      const ceQb2 = makeQb(classRow);
      mockClassEventRepo.createQueryBuilder
        .mockReturnValueOnce(ceQb1)
        .mockReturnValueOnce(ceQb2);

      const profQb = makeQb(null, []);
      const studQb = makeQb(null, []);
      mockClassEventProfRepo.createQueryBuilder.mockReturnValue(profQb);
      mockEnrollmentRepo.createQueryBuilder.mockReturnValue(studQb);

      mockCache.get
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(activeStatus.id);

      await service.resolveClassEventContext('evt-1');
      await service.resolveClassEventContext('evt-1');

      expect(mockEnrollmentStatusRepo.findOne).toHaveBeenCalledTimes(1);
    });

    it('lanza InternalServerErrorException si el estado ACTIVE no existe en BD', async () => {
      mockEnrollmentStatusRepo.findOne.mockResolvedValue(null);
      const ceQb = makeQb(classRow);
      mockClassEventRepo.createQueryBuilder.mockReturnValue(ceQb);

      await expect(
        service.resolveClassEventContext('evt-1'),
      ).rejects.toBeInstanceOf(InternalServerErrorException);
    });
  });

  describe('resolveMaterialContext', () => {
    const materialRow = {
      materialId: 'mat-1',
      materialDisplayName: 'Guía de estudios',
      folderId: 'folder-1',
      courseCycleId: 'cycle-2',
      courseName: 'Historia',
    };

    it('devuelve el contexto con destinatarios fusionados sin duplicados', async () => {
      const matQb = makeQb(materialRow);
      mockMaterialRepo.createQueryBuilder.mockReturnValue(matQb);

      const profQb = makeQb(null, [{ userId: 'p1' }]);
      mockCourseCycleProfRepo.createQueryBuilder.mockReturnValue(profQb);

      const studQb = makeQb(null, [{ userId: 's1' }, { userId: 'p1' }]);
      mockEnrollmentRepo.createQueryBuilder.mockReturnValue(studQb);

      const result = await service.resolveMaterialContext('mat-1', 'folder-1');

      expect(result.materialId).toBe('mat-1');
      expect(result.folderId).toBe('folder-1');
      expect(result.materialDisplayName).toBe('Guía de estudios');
      expect(result.courseName).toBe('Historia');
      expect(result.recipientUserIds).toHaveLength(2);
      expect(result.recipientUserIds).toEqual(
        expect.arrayContaining(['p1', 's1']),
      );
    });

    it('lanza InternalServerErrorException si el material no existe', async () => {
      const matQb = makeQb(null);
      mockMaterialRepo.createQueryBuilder.mockReturnValue(matQb);

      await expect(
        service.resolveMaterialContext('mat-999', 'folder-1'),
      ).rejects.toBeInstanceOf(InternalServerErrorException);
    });
  });

  describe('mergeUniqueUserIds', () => {
    it('devuelve lista vacía cuando no hay listas', async () => {
      const ceQb = makeQb({
        classEventId: 'evt-1',
        classTitle: 'T',
        startDatetime: new Date(),
        courseCycleId: 'c',
        courseName: 'C',
      });
      mockClassEventRepo.createQueryBuilder.mockReturnValue(ceQb);
      mockClassEventProfRepo.createQueryBuilder.mockReturnValue(
        makeQb(null, []),
      );
      mockEnrollmentRepo.createQueryBuilder.mockReturnValue(makeQb(null, []));

      const result = await service.resolveClassEventContext('evt-1');

      expect(result.recipientUserIds).toEqual([]);
    });
  });
});
