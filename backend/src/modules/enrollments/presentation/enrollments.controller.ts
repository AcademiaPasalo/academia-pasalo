import {
  Controller,
  Post,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { EnrollmentsService } from '@modules/enrollments/application/enrollments.service';
import { CreateEnrollmentDto } from '@modules/enrollments/dto/create-enrollment.dto';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { RolesGuard } from '@common/guards/roles.guard';
import { Roles } from '@common/decorators/roles.decorator';
import { ResponseMessage } from '@common/decorators/response-message.decorator';

@Controller('enrollments')
@UseGuards(JwtAuthGuard, RolesGuard)
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
}
