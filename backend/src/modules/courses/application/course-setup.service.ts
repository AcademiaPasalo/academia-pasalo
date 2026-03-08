import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { DataSource } from 'typeorm';
import { CoursesService } from '@modules/courses/application/courses.service';
import { EvaluationsService } from '@modules/evaluations/application/evaluations.service';
import { CreateCourseSetupDto } from '@modules/courses/dto/create-course-setup.dto';
import { UserWithSession } from '@modules/auth/strategies/jwt.strategy';
import { EvaluationDriveAccessProvisioningService } from '@modules/media-access/application/evaluation-drive-access-provisioning.service';
import { CourseCycleDriveProvisioningService } from '@modules/media-access/application/course-cycle-drive-provisioning.service';
import { EVALUATION_TYPE_CODES } from '@modules/evaluations/domain/evaluation.constants';
import { technicalSettings } from '@config/technical-settings';

type EvaluationTypeRow = {
  id: string;
  code: string;
};

type CourseCycleMetaRow = {
  courseCode: string;
  cycleCode: string;
};

type BankEvaluationRow = {
  id: string;
  number: number;
};

type FolderIdRow = {
  id: string;
};

@Injectable()
export class CourseSetupService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly coursesService: CoursesService,
    private readonly evaluationsService: EvaluationsService,
    private readonly evaluationDriveAccessProvisioningService: EvaluationDriveAccessProvisioningService,
    private readonly courseCycleDriveProvisioningService: CourseCycleDriveProvisioningService,
  ) {}

  async createFullCourseSetup(
    user: UserWithSession,
    dto: CreateCourseSetupDto,
  ): Promise<Record<string, unknown>> {
    const allowedTypeIds = this.normalizeIds(dto.allowedEvaluationTypeIds);
    const professorUserIds = this.normalizeIds(dto.professorUserIds || []);
    const evaluationsToCreate = dto.evaluationsToCreate || [];
    if (evaluationsToCreate.length === 0) {
      throw new BadRequestException(
        'evaluationsToCreate debe contener al menos una evaluacion',
      );
    }

    this.ensureUniqueEvaluationKeys(evaluationsToCreate);

    const createdCourse = await this.coursesService.create(dto.course);
    const createdCourseCycle = await this.coursesService.assignToCycle({
      courseId: createdCourse.id,
      academicCycleId: String(dto.academicCycleId || '').trim(),
    });

    for (const professorUserId of professorUserIds) {
      await this.coursesService.assignProfessorToCourseCycle(
        createdCourseCycle.id,
        professorUserId,
      );
    }

    await this.coursesService.updateCourseCycleEvaluationStructure(
      createdCourseCycle.id,
      allowedTypeIds,
    );

    const evaluationTypeRows =
      await this.listEvaluationTypesByIds(allowedTypeIds);
    if (evaluationTypeRows.length !== allowedTypeIds.length) {
      throw new BadRequestException(
        'Uno o mas evaluationTypeIds no existen en catalogo',
      );
    }
    const evaluationTypeCodeById = new Map(
      evaluationTypeRows.map((row) => [
        String(row.id),
        String(row.code || '')
          .trim()
          .toUpperCase(),
      ]),
    );

    const createdEvaluations: Array<{
      id: string;
      evaluationTypeId: string;
      evaluationTypeCode: string;
      number: number;
    }> = [];

    for (const evaluationInput of evaluationsToCreate) {
      const evaluationTypeId = String(
        evaluationInput.evaluationTypeId || '',
      ).trim();
      if (!evaluationTypeCodeById.has(evaluationTypeId)) {
        throw new BadRequestException(
          `El tipo ${evaluationTypeId} no esta en allowedEvaluationTypeIds`,
        );
      }
      const createdEvaluation = await this.evaluationsService.create({
        courseCycleId: createdCourseCycle.id,
        evaluationTypeId,
        number: Number(evaluationInput.number),
        startDate: evaluationInput.startDate,
        endDate: evaluationInput.endDate,
      });
      createdEvaluations.push({
        id: createdEvaluation.id,
        evaluationTypeId,
        evaluationTypeCode: evaluationTypeCodeById.get(evaluationTypeId) || '',
        number: Number(createdEvaluation.number),
      });
    }

    const bankEvaluation = await this.findBankEvaluationForCourseCycle(
      createdCourseCycle.id,
    );
    const allEvaluationIdsForDrive = [
      ...createdEvaluations.map((item) => item.id),
      ...(bankEvaluation ? [bankEvaluation.id] : []),
    ];

    const shouldApplyMaterialsTemplate =
      dto.materialsTemplate.applyToEachEvaluation !== false;
    const templateCreatedForEvaluations: string[] = [];
    if (shouldApplyMaterialsTemplate) {
      for (const createdEvaluation of createdEvaluations) {
        if (
          createdEvaluation.evaluationTypeCode ===
          EVALUATION_TYPE_CODES.BANCO_ENUNCIADOS
        ) {
          continue;
        }
        await this.ensureMaterialTemplateForEvaluation(
          createdEvaluation.id,
          user.id,
          dto.materialsTemplate.roots || [],
        );
        templateCreatedForEvaluations.push(createdEvaluation.id);
      }
    }

    const provisionedEvaluationScopes: string[] = [];
    for (const evaluationId of allEvaluationIdsForDrive) {
      await this.evaluationDriveAccessProvisioningService.provisionByEvaluationId(
        evaluationId,
      );
      provisionedEvaluationScopes.push(evaluationId);
    }

    const courseCycleMeta = await this.getCourseCycleMeta(
      createdCourseCycle.id,
    );
    const bankCards = createdEvaluations
      .filter(
        (evaluation) =>
          evaluation.evaluationTypeCode !==
          EVALUATION_TYPE_CODES.BANCO_ENUNCIADOS,
      )
      .map((evaluation) => ({
        evaluationTypeCode: evaluation.evaluationTypeCode,
        number: evaluation.number,
      }));

    const courseCycleDrive =
      await this.courseCycleDriveProvisioningService.provision({
        courseCycleId: createdCourseCycle.id,
        courseCode: courseCycleMeta.courseCode,
        cycleCode: courseCycleMeta.cycleCode,
        bankCards,
      });

    return {
      course: {
        id: createdCourse.id,
        code: createdCourse.code,
        name: createdCourse.name,
      },
      courseCycle: {
        id: createdCourseCycle.id,
        courseId: createdCourseCycle.courseId,
        academicCycleId: createdCourseCycle.academicCycleId,
      },
      professorsAssigned: professorUserIds,
      allowedEvaluationTypeIds: allowedTypeIds,
      evaluationsCreated: createdEvaluations,
      bankEvaluationCreated: bankEvaluation,
      materialsTemplateApplied: {
        enabled: shouldApplyMaterialsTemplate,
        roots: dto.materialsTemplate.roots || [],
        evaluations: templateCreatedForEvaluations,
      },
      driveProvisioning: {
        evaluationScopesProvisioned: provisionedEvaluationScopes,
        courseCycleScope: courseCycleDrive,
      },
    };
  }

  private normalizeIds(values: string[]): string[] {
    const normalized = values
      .map((value) => String(value || '').trim())
      .filter((value) => value.length > 0);
    return Array.from(new Set(normalized));
  }

  private ensureUniqueEvaluationKeys(
    evaluationsToCreate: Array<{ evaluationTypeId: string; number: number }>,
  ): void {
    const keySet = new Set<string>();
    for (const evaluation of evaluationsToCreate) {
      const evaluationTypeId = String(evaluation.evaluationTypeId || '').trim();
      const number = Number(evaluation.number);
      if (!evaluationTypeId) {
        throw new BadRequestException('evaluationTypeId es obligatorio');
      }
      if (!Number.isInteger(number) || number <= 0) {
        throw new BadRequestException(
          'number debe ser entero positivo para evaluaciones academicas',
        );
      }
      const key = `${evaluationTypeId}:${number}`;
      if (keySet.has(key)) {
        throw new BadRequestException(
          `Evaluacion duplicada en payload: ${key}`,
        );
      }
      keySet.add(key);
    }
  }

  private async listEvaluationTypesByIds(
    evaluationTypeIds: string[],
  ): Promise<EvaluationTypeRow[]> {
    if (!evaluationTypeIds.length) {
      return [];
    }
    const placeholders = evaluationTypeIds.map(() => '?').join(', ');
    return await this.dataSource.query(
      `
        SELECT id, code
        FROM evaluation_type
        WHERE id IN (${placeholders})
      `,
      evaluationTypeIds,
    );
  }

  private async findBankEvaluationForCourseCycle(
    courseCycleId: string,
  ): Promise<{ id: string; number: number } | null> {
    const rows = await this.dataSource.query<BankEvaluationRow[]>(
      `
        SELECT e.id, e.number
        FROM evaluation e
        INNER JOIN evaluation_type et ON et.id = e.evaluation_type_id
        WHERE e.course_cycle_id = ?
          AND et.code = ?
          AND e.number = 0
        LIMIT 1
      `,
      [courseCycleId, EVALUATION_TYPE_CODES.BANCO_ENUNCIADOS],
    );
    return rows[0] || null;
  }

  private async getCourseCycleMeta(
    courseCycleId: string,
  ): Promise<CourseCycleMetaRow> {
    const rows = await this.dataSource.query<CourseCycleMetaRow[]>(
      `
        SELECT
          c.code AS courseCode,
          ac.code AS cycleCode
        FROM course_cycle cc
        INNER JOIN course c ON c.id = cc.course_id
        INNER JOIN academic_cycle ac ON ac.id = cc.academic_cycle_id
        WHERE cc.id = ?
        LIMIT 1
      `,
      [courseCycleId],
    );
    if (!rows[0]) {
      throw new InternalServerErrorException(
        'No se encontro metadata de course_cycle para provision Drive',
      );
    }
    return rows[0];
  }

  private async ensureMaterialTemplateForEvaluation(
    evaluationId: string,
    actorUserId: string,
    roots: Array<{ name: string; subfolderNames?: string[] }>,
  ): Promise<void> {
    const maxDepth = Number(technicalSettings.materials.maxFolderDepth || 3);
    if (maxDepth < 2) {
      throw new InternalServerErrorException(
        'materials.maxFolderDepth debe ser >= 2 para templates',
      );
    }

    const folderStatusRows = await this.dataSource.query<FolderIdRow[]>(
      `SELECT id FROM folder_status WHERE code = 'ACTIVE' LIMIT 1`,
    );
    if (!folderStatusRows[0]?.id) {
      throw new InternalServerErrorException('No existe folder_status ACTIVE');
    }
    const folderStatusId = folderStatusRows[0].id;

    for (const root of roots) {
      const rootName = String(root.name || '').trim();
      if (!rootName) {
        throw new BadRequestException('Nombre de carpeta raiz invalido');
      }
      const rootFolderId = await this.findOrCreateFolder({
        evaluationId,
        parentFolderId: null,
        folderStatusId,
        name: rootName,
        actorUserId,
      });

      const children = Array.from(
        new Set(
          (root.subfolderNames || [])
            .map((item) => String(item || '').trim())
            .filter(Boolean),
        ),
      );
      if (children.length === 0) {
        continue;
      }
      if (maxDepth < 2) {
        throw new BadRequestException(
          'La configuracion actual no permite subcarpetas',
        );
      }
      for (const childName of children) {
        await this.findOrCreateFolder({
          evaluationId,
          parentFolderId: rootFolderId,
          folderStatusId,
          name: childName,
          actorUserId,
        });
      }
    }
  }

  private async findOrCreateFolder(input: {
    evaluationId: string;
    parentFolderId: string | null;
    folderStatusId: string;
    name: string;
    actorUserId: string;
  }): Promise<string> {
    const { evaluationId, parentFolderId, folderStatusId, name, actorUserId } =
      input;
    const rows = await this.dataSource.query<FolderIdRow[]>(
      `
        SELECT id
        FROM material_folder
        WHERE evaluation_id = ?
          AND name = ?
          AND (
            (? IS NULL AND parent_folder_id IS NULL)
            OR parent_folder_id = ?
          )
        LIMIT 1
      `,
      [evaluationId, name, parentFolderId, parentFolderId],
    );
    if (rows[0]?.id) {
      return rows[0].id;
    }

    await this.dataSource.query(
      `
        INSERT INTO material_folder
          (evaluation_id, parent_folder_id, folder_status_id, name, visible_from, visible_until, created_by, created_at, updated_at)
        VALUES
          (?, ?, ?, ?, NULL, NULL, ?, NOW(), NOW())
      `,
      [evaluationId, parentFolderId, folderStatusId, name, actorUserId],
    );

    const createdRows = await this.dataSource.query<FolderIdRow[]>(
      `
        SELECT id
        FROM material_folder
        WHERE evaluation_id = ?
          AND name = ?
          AND (
            (? IS NULL AND parent_folder_id IS NULL)
            OR parent_folder_id = ?
          )
        ORDER BY id DESC
        LIMIT 1
      `,
      [evaluationId, name, parentFolderId, parentFolderId],
    );

    if (!createdRows[0]?.id) {
      throw new InternalServerErrorException(
        'No se pudo persistir carpeta de material',
      );
    }
    return createdRows[0].id;
  }
}
