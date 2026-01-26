import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { MaterialFolderRepository } from '@modules/materials/infrastructure/material-folder.repository';
import { FolderStatusRepository } from '@modules/materials/infrastructure/folder-status.repository';
import { EvaluationRepository } from '@modules/evaluations/infrastructure/evaluation.repository';
import { CreateFolderDto } from '@modules/materials/dto/create-folder.dto';
import { MaterialFolder } from '@modules/materials/domain/material-folder.entity';

@Injectable()
export class MaterialsService {
  private readonly logger = new Logger(MaterialsService.name);

  constructor(
    private readonly folderRepository: MaterialFolderRepository,
    private readonly statusRepository: FolderStatusRepository,
    private readonly evaluationRepository: EvaluationRepository,
  ) {}

  async createFolder(dto: CreateFolderDto, userId: string): Promise<MaterialFolder> {
    const evaluation = await this.evaluationRepository.findByIds([dto.evaluationId]);
    if (evaluation.length === 0) {
      throw new NotFoundException('La evaluación solicitada no existe.');
    }

    if (dto.parentFolderId) {
      const parent = await this.folderRepository.findById(dto.parentFolderId);
      if (!parent) {
        throw new NotFoundException('La carpeta superior no existe.');
      }
      if (parent.evaluationId !== dto.evaluationId) {
        throw new BadRequestException('La subcarpeta debe pertenecer a la misma evaluación que la carpeta padre.');
      }
    }

    const status = await this.statusRepository.findByCode('ACTIVE');
    if (!status) {
      throw new BadRequestException('Estado de carpeta no configurado en el sistema.');
    }

    const folder = await this.folderRepository.create({
      evaluationId: dto.evaluationId,
      parentFolderId: dto.parentFolderId || null,
      folderStatusId: status.id,
      name: dto.name,
      visibleFrom: dto.visibleFrom ? new Date(dto.visibleFrom) : null,
      visibleUntil: dto.visibleUntil ? new Date(dto.visibleUntil) : null,
      createdBy: userId,
    });

    this.logger.log({
      message: 'Carpeta de materiales creada exitosamente',
      folderId: folder.id,
      evaluationId: dto.evaluationId,
      userId,
      timestamp: new Date().toISOString(),
    });

    return folder;
  }

  async getFoldersByEvaluation(evaluationId: string): Promise<MaterialFolder[]> {
    return await this.folderRepository.findByEvaluation(evaluationId);
  }
}
