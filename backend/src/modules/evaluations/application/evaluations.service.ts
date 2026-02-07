import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { Evaluation } from '@modules/evaluations/domain/evaluation.entity';
import { CreateEvaluationDto } from '@modules/evaluations/dto/create-evaluation.dto';
import { EvaluationRepository } from '@modules/evaluations/infrastructure/evaluation.repository';
import { CourseCycleRepository } from '@modules/courses/infrastructure/course-cycle.repository';
import { AcademicCycleRepository } from '@modules/cycles/infrastructure/academic-cycle.repository';

@Injectable()
export class EvaluationsService {
  private readonly logger = new Logger(EvaluationsService.name);

  constructor(
    private readonly evaluationRepository: EvaluationRepository,
    private readonly courseCycleRepository: CourseCycleRepository,
    private readonly academicCycleRepository: AcademicCycleRepository,
  ) {}

  async create(dto: CreateEvaluationDto): Promise<Evaluation> {
    const courseCycle = await this.courseCycleRepository.findById(
      dto.courseCycleId,
    );
    if (!courseCycle) {
      throw new NotFoundException('La instancia de curso-ciclo no existe.');
    }

    const academicCycle = await this.academicCycleRepository.findById(
      courseCycle.academicCycleId,
    );
    if (!academicCycle) {
      throw new NotFoundException('El ciclo académico vinculado no existe.');
    }

    const evalStart = new Date(dto.startDate);
    const evalEnd = new Date(dto.endDate);
    const cycleStart = new Date(academicCycle.startDate);
    const cycleEnd = new Date(academicCycle.endDate);

    if (evalStart < cycleStart || evalEnd > cycleEnd) {
      throw new BadRequestException(
        'Las fechas de la evaluación deben estar dentro del rango del ciclo académico.',
      );
    }

    if (evalStart > evalEnd) {
      throw new BadRequestException(
        'La fecha de inicio no puede ser posterior a la fecha de fin.',
      );
    }

    const evaluation = await this.evaluationRepository.create({
      courseCycleId: dto.courseCycleId,
      evaluationTypeId: dto.evaluationTypeId,
      number: dto.number,
      startDate: evalStart,
      endDate: evalEnd,
    });

    this.logger.log({
      message: 'Evaluación académica creada exitosamente',
      evaluationId: evaluation.id,
      courseCycleId: dto.courseCycleId,
      typeId: dto.evaluationTypeId,
      timestamp: new Date().toISOString(),
    });

    return evaluation;
  }

  async findByCourseCycle(courseCycleId: string): Promise<Evaluation[]> {
    return await this.evaluationRepository.findByCourseCycle(courseCycleId);
  }
}
