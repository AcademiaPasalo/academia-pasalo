import {
  Controller,
  Post,
  Get,
  Body,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { EnrollmentsService } from '@modules/enrollments/application/enrollments.service';
import { CreateEnrollmentDto } from '@modules/enrollments/dto/create-enrollment.dto';
import { Auth } from '@common/decorators/auth.decorator';
import { Roles } from '@common/decorators/roles.decorator';
import { CurrentUser } from '@common/decorators/current-user.decorator';
import { User } from '@modules/users/domain/user.entity';
import { ResponseMessage } from '@common/decorators/response-message.decorator';

@Controller('enrollments')
@Auth()
export class EnrollmentsController {
  constructor(private readonly enrollmentsService: EnrollmentsService) {}

  @Post()
  @Roles('ADMIN', 'SUPER_ADMIN')
  @HttpCode(HttpStatus.CREATED)
  @ResponseMessage('Usuario matriculado exitosamente en el curso')
  async enroll(@Body() dto: CreateEnrollmentDto) {
    const enrollment = await this.enrollmentsService.enroll(dto);
    return enrollment;
  }

  @Get('my-courses')
  @Roles('STUDENT', 'ADMIN', 'PROFESSOR', 'SUPER_ADMIN')
  @ResponseMessage('Listado de cursos obtenido exitosamente')
  async getMyCourses(@CurrentUser() user: User) {
    return await this.enrollmentsService.findMyEnrollments(user.id);
  }
}