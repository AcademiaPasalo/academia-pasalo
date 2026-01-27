import { Injectable, NotFoundException, ConflictException, Logger, InternalServerErrorException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { CourseRepository } from '@modules/courses/infrastructure/course.repository';
import { CourseTypeRepository } from '@modules/courses/infrastructure/course-type.repository';
import { CycleLevelRepository } from '@modules/courses/infrastructure/cycle-level.repository';
import { CourseCycleRepository } from '@modules/courses/infrastructure/course-cycle.repository';
import { EvaluationRepository } from '@modules/evaluations/infrastructure/evaluation.repository';
import { CyclesService } from '@modules/cycles/application/cycles.service';
import { Course } from '@modules/courses/domain/course.entity';
import { CourseType } from '@modules/courses/domain/course-type.entity';
import { CycleLevel } from '@modules/courses/domain/cycle-level.entity';
import { CourseCycle } from '@modules/courses/domain/course-cycle.entity';
import { CreateCourseDto } from '@modules/courses/dto/create-course.dto';
import { AssignCourseToCycleDto } from '@modules/courses/dto/assign-course-to-cycle.dto';

@Injectable()
export class CoursesService {
  private readonly logger = new Logger(CoursesService.name);

  constructor(
    private readonly dataSource: DataSource,
    private readonly courseRepository: CourseRepository,
    private readonly courseTypeRepository: CourseTypeRepository,
    private readonly cycleLevelRepository: CycleLevelRepository,
    private readonly courseCycleRepository: CourseCycleRepository,
    private readonly evaluationRepository: EvaluationRepository,
    private readonly cyclesService: CyclesService,
  ) {}

  async findAllCourses(): Promise<Course[]> {
    return await this.courseRepository.findAll();
  }

  async findCourseById(id: string): Promise<Course> {
    const course = await this.courseRepository.findById(id);
    if (!course) {
      this.logger.warn({
        message: 'Consulta de materia inexistente',
        courseId: id,
        timestamp: new Date().toISOString(),
      });
      throw new NotFoundException('La materia solicitada no se encuentra disponible.');
    }
    return course;
  }

  async create(dto: CreateCourseDto): Promise<Course> {
    const existing = await this.courseRepository.findByCode(dto.code);
    if (existing) {
      throw new ConflictException('Ya existe una materia registrada con ese código.');
    }
    
    const course = await this.dataSource.transaction(async (manager) => {
      const repo = manager.getRepository(Course);
      const newCourse = repo.create({
        code: dto.code,
        name: dto.name,
        courseTypeId: dto.courseTypeId,
        cycleLevelId: dto.cycleLevelId,
      });
      return await repo.save(newCourse);
    });

    return await this.findCourseById(course.id);
  }

  async assignToCycle(dto: AssignCourseToCycleDto): Promise<CourseCycle> {
    const course = await this.findCourseById(dto.courseId);
    const cycle = await this.cyclesService.findOne(dto.academicCycleId);

    const existing = await this.courseCycleRepository.findByCourseAndCycle(dto.courseId, dto.academicCycleId);
    if (existing) {
      throw new ConflictException('Esta materia ya se encuentra vinculada al ciclo seleccionado.');
    }

    return await this.dataSource.transaction(async (manager) => {
      const courseCycle = await this.courseCycleRepository.create({
        courseId: course.id,
        academicCycleId: cycle.id,
      }, manager);

      const bancoType = await this.evaluationRepository.findTypeByCode('BANCO_ENUNCIADOS', manager);
      if (!bancoType) {
        this.logger.error({
          message: 'Tipo de evaluación BANCO_ENUNCIADOS no configurado en el catálogo',
          timestamp: new Date().toISOString(),
        });
        throw new InternalServerErrorException('Error de configuración del sistema: Tipo de evaluación faltante.');
      }

      await this.evaluationRepository.create({
        courseCycleId: courseCycle.id,
        evaluationTypeId: bancoType.id,
        number: 0,
        startDate: cycle.startDate,
        endDate: cycle.endDate,
      }, manager);

      this.logger.log({
        message: 'Materia vinculada a ciclo exitosamente con Banco de Enunciados',
        courseId: course.id,
        cycleId: cycle.id,
        courseCycleId: courseCycle.id,
        timestamp: new Date().toISOString(),
      });

      return courseCycle;
    });
  }

  async findAllTypes(): Promise<CourseType[]> {
    return await this.courseTypeRepository.findAll();
  }

  async findAllLevels(): Promise<CycleLevel[]> {
    return await this.cycleLevelRepository.findAll();
  }
}