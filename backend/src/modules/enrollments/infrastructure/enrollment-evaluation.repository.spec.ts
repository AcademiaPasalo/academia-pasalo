import { Repository } from 'typeorm';
import { EnrollmentEvaluationRepository } from '@modules/enrollments/infrastructure/enrollment-evaluation.repository';
import { EnrollmentEvaluation } from '@modules/enrollments/domain/enrollment-evaluation.entity';

describe('EnrollmentEvaluationRepository', () => {
  let repository: EnrollmentEvaluationRepository;
  let ormRepository: jest.Mocked<Partial<Repository<EnrollmentEvaluation>>>;

  beforeEach(() => {
    ormRepository = {
      query: jest.fn(),
      find: jest.fn(),
      createQueryBuilder: jest.fn(),
    };
    repository = new EnrollmentEvaluationRepository(
      ormRepository as Repository<EnrollmentEvaluation>,
    );
  });

  it('findEvaluationIdsToRevokeAfterEnrollmentCancellation devuelve ids normalizados', async () => {
    (ormRepository.query as jest.Mock).mockResolvedValue([
      { evaluationId: 101 },
      { evaluationId: '202' },
    ]);

    const result =
      await repository.findEvaluationIdsToRevokeAfterEnrollmentCancellation(
        '10',
        '20',
      );

    expect(ormRepository.query).toHaveBeenCalledTimes(1);
    expect(result).toEqual(['101', '202']);
  });

  it('findEvaluationIdsToRevokeAfterEnrollmentCancellation maneja lista vacia', async () => {
    (ormRepository.query as jest.Mock).mockResolvedValue([]);

    const result =
      await repository.findEvaluationIdsToRevokeAfterEnrollmentCancellation(
        '10',
        '20',
      );

    expect(result).toEqual([]);
  });
});
