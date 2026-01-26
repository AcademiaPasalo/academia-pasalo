import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { CoursesService } from '@modules/courses/application/courses.service';
import {
  CourseResponseDto,
  CourseTypeResponseDto,
  CycleLevelResponseDto,
} from '@modules/courses/dto/course-response.dto';
import { CreateCourseDto } from '@modules/courses/dto/create-course.dto';
import { AssignCourseToCycleDto } from '@modules/courses/dto/assign-course-to-cycle.dto';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { RolesGuard } from '@common/guards/roles.guard';
import { Roles } from '@common/decorators/roles.decorator';
import { ResponseMessage } from '@common/decorators/response-message.decorator';
import { plainToInstance } from 'class-transformer';

@Controller('courses')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @Post()
  @Roles('ADMIN', 'SUPER_ADMIN')
  @HttpCode(HttpStatus.CREATED)
  @ResponseMessage('Materia creada exitosamente')
  async create(@Body() createCourseDto: CreateCourseDto) {
    const course = await this.coursesService.create(createCourseDto);
    return plainToInstance(CourseResponseDto, course, {
      excludeExtraneousValues: true,
    });
  }

  @Post('assign-cycle')
  @Roles('ADMIN', 'SUPER_ADMIN')
  @HttpCode(HttpStatus.CREATED)
  @ResponseMessage('Materia vinculada al ciclo exitosamente')
  async assignToCycle(@Body() dto: AssignCourseToCycleDto) {
    const courseCycle = await this.coursesService.assignToCycle(dto);
    // Retornamos el objeto básico de vinculación
    return courseCycle;
  }

  @Get()
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ResponseMessage('Materias obtenidas exitosamente')
  async findAll() {
    const courses = await this.coursesService.findAllCourses();
    return plainToInstance(CourseResponseDto, courses, {
      excludeExtraneousValues: true,
    });
  }

  @Get('types')
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ResponseMessage('Tipos de curso obtenidos exitosamente')
  async findAllTypes() {
    const types = await this.coursesService.findAllTypes();
    return plainToInstance(CourseTypeResponseDto, types, {
      excludeExtraneousValues: true,
    });
  }

  @Get('levels')
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ResponseMessage('Niveles académicos obtenidos exitosamente')
  async findAllLevels() {
    const levels = await this.coursesService.findAllLevels();
    return plainToInstance(CycleLevelResponseDto, levels, {
      excludeExtraneousValues: true,
    });
  }

  @Get(':id')
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ResponseMessage('Materia obtenida exitosamente')
  async findOne(@Param('id') id: string) {
    const course = await this.coursesService.findCourseById(id);
    return plainToInstance(CourseResponseDto, course, {
      excludeExtraneousValues: true,
    });
  }
}