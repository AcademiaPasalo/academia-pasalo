import { InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DriveScopeNamingService } from '@modules/media-access/application/drive-scope-naming.service';

describe('DriveScopeNamingService', () => {
  const createConfigService = (values: Record<string, string | undefined>) =>
    ({
      get: (key: string, fallback?: string) =>
        values[key] !== undefined ? values[key] : fallback,
    }) as ConfigService;

  it('should build deterministic names for a valid evaluation context', () => {
    const configService = createConfigService({
      GOOGLE_WORKSPACE_GROUP_DOMAIN: 'academiapasalo.com',
    });
    const service = new DriveScopeNamingService(configService);

    const result = service.buildForEvaluation({
      evaluationId: '552',
      courseCycleId: '17',
      courseCode: 'MATE101',
      cycleCode: '2026-0',
      evaluationTypeCode: 'PC',
      evaluationNumber: 1,
    });

    expect(result).toEqual({
      evaluationId: '552',
      scopeKey: 'ev_552',
      parentFolderNames: ['evaluations', '2026-0', 'cc_17_MATE101'],
      baseFolderName: 'ev_552_PC1',
      videosFolderName: 'videos',
      documentsFolderName: 'documentos',
      archivedFolderName: 'archivado',
      viewerGroupEmail: 'ev-552-viewers@academiapasalo.com',
    });
  });

  it('should normalize spaces and lowercase workspace domain', () => {
    const configService = createConfigService({
      GOOGLE_WORKSPACE_GROUP_DOMAIN: ' AcademiaPasalo.COM ',
    });
    const service = new DriveScopeNamingService(configService);

    const result = service.buildForEvaluation({
      evaluationId: ' 77 ',
      courseCycleId: ' 19 ',
      courseCode: ' FIS101 ',
      cycleCode: ' 2026-0 ',
      evaluationTypeCode: ' EX ',
      evaluationNumber: 2,
    });

    expect(result.evaluationId).toBe('77');
    expect(result.parentFolderNames).toEqual([
      'evaluations',
      '2026-0',
      'cc_19_FIS101',
    ]);
    expect(result.viewerGroupEmail).toBe('ev-77-viewers@academiapasalo.com');
  });

  it('should throw if evaluation id is not numeric', () => {
    const configService = createConfigService({
      GOOGLE_WORKSPACE_GROUP_DOMAIN: 'academiapasalo.com',
    });
    const service = new DriveScopeNamingService(configService);

    expect(() =>
      service.buildForEvaluation({
        evaluationId: 'pc1',
        courseCycleId: '19',
        courseCode: 'FIS101',
        cycleCode: '2026-0',
        evaluationTypeCode: 'PC',
        evaluationNumber: 1,
      }),
    ).toThrow(InternalServerErrorException);
  });

  it('should throw when workspace group domain is missing', () => {
    const configService = createConfigService({
      GOOGLE_WORKSPACE_GROUP_DOMAIN: '',
    });
    const service = new DriveScopeNamingService(configService);

    expect(() =>
      service.buildForEvaluation({
        evaluationId: '1',
        courseCycleId: '17',
        courseCode: 'MATE101',
        cycleCode: '2026-0',
        evaluationTypeCode: 'PC',
        evaluationNumber: 1,
      }),
    ).toThrow(InternalServerErrorException);
  });
});
