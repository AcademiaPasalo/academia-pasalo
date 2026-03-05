import { InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DriveScopeNamingService } from '@modules/media-access/application/drive-scope-naming.service';

describe('DriveScopeNamingService', () => {
  const createConfigService = (values: Record<string, string | undefined>) =>
    ({
      get: (key: string, fallback?: string) =>
        values[key] !== undefined ? values[key] : fallback,
    }) as ConfigService;

  it('should build deterministic names for a valid evaluation id', () => {
    const configService = createConfigService({
      GOOGLE_WORKSPACE_GROUP_DOMAIN: 'academiapasalo.com',
    });
    const service = new DriveScopeNamingService(configService);

    const result = service.buildForEvaluation('552');

    expect(result).toEqual({
      evaluationId: '552',
      scopeKey: 'ev_552',
      baseFolderName: 'ev_552',
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

    const result = service.buildForEvaluation(' 77 ');

    expect(result.evaluationId).toBe('77');
    expect(result.viewerGroupEmail).toBe('ev-77-viewers@academiapasalo.com');
  });

  it('should throw if evaluation id is not numeric', () => {
    const configService = createConfigService({
      GOOGLE_WORKSPACE_GROUP_DOMAIN: 'academiapasalo.com',
    });
    const service = new DriveScopeNamingService(configService);

    expect(() => service.buildForEvaluation('pc1')).toThrow(
      InternalServerErrorException,
    );
  });

  it('should throw when workspace group domain is missing', () => {
    const configService = createConfigService({
      GOOGLE_WORKSPACE_GROUP_DOMAIN: '',
    });
    const service = new DriveScopeNamingService(configService);

    expect(() => service.buildForEvaluation('1')).toThrow(
      InternalServerErrorException,
    );
  });
});
