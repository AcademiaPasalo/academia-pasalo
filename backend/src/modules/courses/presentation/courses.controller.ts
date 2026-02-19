import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { CoursesService } from '@modules/courses/application/courses.service';
import {
  CourseResponseDto,
  CourseTypeResponseDto,
  CycleLevelResponseDto,
} from '@modules/courses/dto/course-response.dto';
import { CourseContentResponseDto } from '@modules/courses/dto/course-content.dto';
import { UserResponseDto } from '@modules/users/dto/user-response.dto';
import { CreateCourseDto } from '@modules/courses/dto/create-course.dto';
import { UpdateCourseDto } from '@modules/courses/dto/update-course.dto';
import { AssignCourseToCycleDto } from '@modules/courses/dto/assign-course-to-cycle.dto';
import { AssignCourseCycleProfessorDto } from '@modules/courses/dto/assign-course-cycle-professor.dto';
import { Auth } from '@common/decorators/auth.decorator';
import { Roles } from '@common/decorators/roles.decorator';
import { CurrentUser } from '@common/decorators/current-user.decorator';
import { User } from '@modules/users/domain/user.entity';
import { ResponseMessage } from '@common/decorators/response-message.decorator';
import { plainToInstance } from 'class-transformer';
import { ROLE_CODES } from '@common/constants/role-codes.constants';
import { Patch } from '@nestjs/common';

@Controller('courses')
@Auth()
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @Get('cycle/:id/content')
  @Roles(
    ROLE_CODES.STUDENT,
    ROLE_CODES.PROFESSOR,
    ROLE_CODES.ADMIN,
    ROLE_CODES.SUPER_ADMIN,
  )
  @ResponseMessage('Contenido del curso obtenido exitosamente')
  async getCourseContent(
    @Param('id') courseCycleId: string,
    @CurrentUser() user: User,
  ) {
    const content = await this.coursesService.getCourseContent(
      courseCycleId,
      user.id,
    );
    return plainToInstance(CourseContentResponseDto, content, {
      excludeExtraneousValues: true,
    });
  }

  @Post()
  @Roles(ROLE_CODES.ADMIN, ROLE_CODES.SUPER_ADMIN)
  @HttpCode(HttpStatus.CREATED)
  @ResponseMessage('Materia creada exitosamente')
  async create(@Body() createCourseDto: CreateCourseDto) {
    const course = await this.coursesService.create(createCourseDto);
    return plainToInstance(CourseResponseDto, course, {
      excludeExtraneousValues: true,
    });
  }

  @Patch(':id')
  @Roles(ROLE_CODES.ADMIN, ROLE_CODES.SUPER_ADMIN)
  @ResponseMessage('Materia actualizada exitosamente')
  async update(
    @Param('id') id: string,
    @Body() updateCourseDto: UpdateCourseDto,
  ) {
    const course = await this.coursesService.update(id, updateCourseDto);
    return plainToInstance(CourseResponseDto, course, {
      excludeExtraneousValues: true,
    });
  }

  @Post('assign-cycle')
  @Roles(ROLE_CODES.ADMIN, ROLE_CODES.SUPER_ADMIN)
  @HttpCode(HttpStatus.CREATED)
  @ResponseMessage('Materia vinculada al ciclo exitosamente')
  async assignToCycle(@Body() dto: AssignCourseToCycleDto) {
    const result = await this.coursesService.assignToCycle(dto);
    return {
      statusCode: 201,
      message: 'Curso asignado al ciclo exitosamente',
      data: result,
    };
  }

  @Get('cycle/:id/professors')
  @Roles(ROLE_CODES.PROFESSOR, ROLE_CODES.ADMIN, ROLE_CODES.SUPER_ADMIN)
  @ResponseMessage('Profesores del curso obtenidos exitosamente')
  async getProfessorsByCycle(@Param('id') courseCycleId: string) {
    const professors =
      await this.coursesService.getProfessorsByCourseCycle(courseCycleId);
    return plainToInstance(UserResponseDto, professors, {
      excludeExtraneousValues: true,
    });
  }

  @Post('cycle/:id/professors')
  @Roles(ROLE_CODES.ADMIN, ROLE_CODES.SUPER_ADMIN)
  @HttpCode(HttpStatus.CREATED)
  @ResponseMessage('Profesor asignado al curso/ciclo exitosamente')
  async assignProfessorToCycle(
    @Param('id') courseCycleId: string,
    @Body() dto: AssignCourseCycleProfessorDto,
  ): Promise<void> {
    await this.coursesService.assignProfessorToCourseCycle(
      courseCycleId,
      dto.professorUserId,
    );
  }

  @Delete('cycle/:id/professors/:professorUserId')
  @Roles(ROLE_CODES.ADMIN, ROLE_CODES.SUPER_ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ResponseMessage('Profesor removido del curso/ciclo exitosamente')
  async revokeProfessorFromCycle(
    @Param('id') courseCycleId: string,
    @Param('professorUserId') professorUserId: string,
  ): Promise<void> {
    await this.coursesService.revokeProfessorFromCourseCycle(
      courseCycleId,
      professorUserId,
    );
  }

  @Get()
  @Roles(ROLE_CODES.ADMIN, ROLE_CODES.SUPER_ADMIN)
  @ResponseMessage('Materias obtenidas exitosamente')
  async findAll() {
    const courses = await this.coursesService.findAllCourses();
    return plainToInstance(CourseResponseDto, courses, {
      excludeExtraneousValues: true,
    });
  }

  @Get('types')
  @Roles(ROLE_CODES.ADMIN, ROLE_CODES.SUPER_ADMIN)
  @ResponseMessage('Tipos de curso obtenidos exitosamente')
  async findAllTypes() {
    const types = await this.coursesService.findAllTypes();
    return plainToInstance(CourseTypeResponseDto, types, {
      excludeExtraneousValues: true,
    });
  }

  @Get('levels')
  @Roles(ROLE_CODES.ADMIN, ROLE_CODES.SUPER_ADMIN)
  @ResponseMessage('Niveles académicos obtenidos exitosamente')
  async findAllLevels() {
    const levels = await this.coursesService.findAllLevels();
    return plainToInstance(CycleLevelResponseDto, levels, {
      excludeExtraneousValues: true,
    });
  }

  @Get(':id')
  @Roles(ROLE_CODES.ADMIN, ROLE_CODES.SUPER_ADMIN)
  @ResponseMessage('Materia obtenida exitosamente')
  async findOne(@Param('id') id: string) {
    const course = await this.coursesService.findCourseById(id);
    return plainToInstance(CourseResponseDto, course, {
      excludeExtraneousValues: true,
    });
  }
}
