import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  Post,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Auth } from '@common/decorators/auth.decorator';
import { Roles } from '@common/decorators/roles.decorator';
import { CurrentUser } from '@common/decorators/current-user.decorator';
import type { UserWithSession } from '@modules/auth/strategies/jwt.strategy';
import { ROLE_CODES } from '@common/constants/role-codes.constants';
import { ResponseMessage } from '@common/decorators/response-message.decorator';
import { MediaAccessMembershipDispatchService } from '@modules/media-access/application/media-access-membership-dispatch.service';
import { RecoverEvaluationScopeDto } from '@modules/media-access/dto/recover-evaluation-scope.dto';
import { MEDIA_ACCESS_SYNC_SOURCES } from '@modules/media-access/domain/media-access.constants';
import { Evaluation } from '@modules/evaluations/domain/evaluation.entity';

@Controller('admin/media-access')
@Auth(ROLE_CODES.ADMIN, ROLE_CODES.SUPER_ADMIN)
export class MediaAccessAdminController {
  constructor(
    @InjectRepository(Evaluation)
    private readonly evaluationRepository: Repository<Evaluation>,
    private readonly mediaAccessMembershipDispatchService: MediaAccessMembershipDispatchService,
  ) {}

  @Post('evaluations/:evaluationId/recover-scope')
  @Roles(ROLE_CODES.ADMIN, ROLE_CODES.SUPER_ADMIN)
  @HttpCode(HttpStatus.ACCEPTED)
  @ResponseMessage('Recuperación de scope Drive encolada exitosamente')
  async recoverEvaluationScope(
    @CurrentUser() user: UserWithSession,
    @Param('evaluationId') evaluationId: string,
    @Body() dto: RecoverEvaluationScopeDto,
  ) {
    const normalizedEvaluationId = String(evaluationId || '').trim();
    const evaluation = await this.evaluationRepository.findOne({
      where: { id: normalizedEvaluationId },
      select: { id: true },
    });
    if (!evaluation) {
      throw new NotFoundException('Evaluación no encontrada');
    }

    const reconcileMembers = dto.reconcileMembers !== false;
    const pruneExtraMembers = dto.pruneExtraMembers === true;
    const result =
      await this.mediaAccessMembershipDispatchService.enqueueRecoverEvaluationScope(
        {
          evaluationId: normalizedEvaluationId,
          requestedByUserId: user.id,
          reconcileMembers,
          pruneExtraMembers,
          source: MEDIA_ACCESS_SYNC_SOURCES.ADMIN_MANUAL_RECOVERY,
        },
      );

    return {
      jobId: result.jobId,
      status: 'ENQUEUED',
      evaluationId: normalizedEvaluationId,
      reconcileMembers,
      pruneExtraMembers,
    };
  }
}
