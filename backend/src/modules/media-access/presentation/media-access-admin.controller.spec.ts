import { NotFoundException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Test } from '@nestjs/testing';
import { Repository } from 'typeorm';
import { Evaluation } from '@modules/evaluations/domain/evaluation.entity';
import { MediaAccessAdminController } from '@modules/media-access/presentation/media-access-admin.controller';
import { MediaAccessMembershipDispatchService } from '@modules/media-access/application/media-access-membership-dispatch.service';

describe('MediaAccessAdminController', () => {
  let controller: MediaAccessAdminController;
  let evaluationRepository: jest.Mocked<Partial<Repository<Evaluation>>>;
  let dispatchService: jest.Mocked<MediaAccessMembershipDispatchService>;

  beforeEach(async () => {
    evaluationRepository = {
      findOne: jest.fn(),
    };
    dispatchService = {
      enqueueRecoverEvaluationScope: jest.fn(),
    } as unknown as jest.Mocked<MediaAccessMembershipDispatchService>;

    const moduleRef = await Test.createTestingModule({
      controllers: [MediaAccessAdminController],
      providers: [
        {
          provide: getRepositoryToken(Evaluation),
          useValue: evaluationRepository,
        },
        {
          provide: MediaAccessMembershipDispatchService,
          useValue: dispatchService,
        },
      ],
    }).compile();

    controller = moduleRef.get(MediaAccessAdminController);
  });

  it('encola recover scope cuando la evaluación existe', async () => {
    (evaluationRepository.findOne as jest.Mock).mockResolvedValue({
      id: '200',
    } as Evaluation);
    dispatchService.enqueueRecoverEvaluationScope.mockResolvedValue({
      jobId: 'job-1',
    });

    const result = await controller.recoverEvaluationScope(
      { id: '10' } as never,
      ' 200 ',
      { reconcileMembers: true, pruneExtraMembers: false },
    );

    expect(dispatchService.enqueueRecoverEvaluationScope).toHaveBeenCalledWith({
      evaluationId: '200',
      requestedByUserId: '10',
      reconcileMembers: true,
      pruneExtraMembers: false,
      source: 'ADMIN_MANUAL_RECOVERY',
    });
    expect(result).toEqual({
      jobId: 'job-1',
      status: 'ENQUEUED',
      evaluationId: '200',
      reconcileMembers: true,
      pruneExtraMembers: false,
    });
  });

  it('falla con 404 cuando la evaluación no existe', async () => {
    (evaluationRepository.findOne as jest.Mock).mockResolvedValue(null);

    await expect(
      controller.recoverEvaluationScope({ id: '10' } as never, '999', {
        reconcileMembers: true,
        pruneExtraMembers: false,
      }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });
});
