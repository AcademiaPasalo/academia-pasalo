import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { EvaluationsService } from '@modules/evaluations/application/evaluations.service';
import { CreateEvaluationDto } from '@modules/evaluations/dto/create-evaluation.dto';
import { Auth } from '@common/decorators/auth.decorator';
import { Roles } from '@common/decorators/roles.decorator';
import { ResponseMessage } from '@common/decorators/response-message.decorator';
import { ROLE_CODES } from '@common/constants/role-codes.constants';

@Controller('evaluations')
@Auth()
export class EvaluationsController {
  constructor(private readonly evaluationsService: EvaluationsService) {}

  @Post()
  @Roles(ROLE_CODES.ADMIN, ROLE_CODES.SUPER_ADMIN)
  @HttpCode(HttpStatus.CREATED)
  @ResponseMessage('Evaluación académica creada exitosamente')
  async create(@Body() dto: CreateEvaluationDto) {
    return await this.evaluationsService.create(dto);
  }

  @Get('course-cycle/:id')
  @Roles(ROLE_CODES.PROFESSOR, ROLE_CODES.ADMIN, ROLE_CODES.SUPER_ADMIN)
  @ResponseMessage('Evaluaciones obtenidas exitosamente')
  async findByCourseCycle(@Param('id') id: string) {
    return await this.evaluationsService.findByCourseCycle(id);
  }
}
