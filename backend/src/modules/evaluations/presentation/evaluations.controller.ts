import { Controller, Post, Body, Get, Param, UseGuards, HttpStatus, HttpCode } from '@nestjs/common';
import { EvaluationsService } from '@modules/evaluations/application/evaluations.service';
import { CreateEvaluationDto } from '@modules/evaluations/dto/create-evaluation.dto';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { RolesGuard } from '@common/guards/roles.guard';
import { Roles } from '@common/decorators/roles.decorator';
import { ResponseMessage } from '@common/decorators/response-message.decorator';

@Controller('evaluations')
@UseGuards(JwtAuthGuard, RolesGuard)
export class EvaluationsController {
  constructor(private readonly evaluationsService: EvaluationsService) {}

  @Post()
  @Roles('ADMIN', 'SUPER_ADMIN')
  @HttpCode(HttpStatus.CREATED)
  @ResponseMessage('Evaluación académica creada exitosamente')
  async create(@Body() dto: CreateEvaluationDto) {
    return await this.evaluationsService.create(dto);
  }

  @Get('course-cycle/:id')
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ResponseMessage('Evaluaciones obtenidas exitosamente')
  async findByCourseCycle(@Param('id') id: string) {
    return await this.evaluationsService.findByCourseCycle(id);
  }
}
