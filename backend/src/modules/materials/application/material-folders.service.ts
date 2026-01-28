import { Injectable, Logger, NotFoundException, BadRequestException, ForbiddenException, InternalServerErrorException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { MaterialFolderRepository } from '@modules/materials/infrastructure/material-folder.repository';
import { FolderStatusRepository } from '@modules/materials/infrastructure/folder-status.repository';
import { EvaluationRepository } from '@modules/evaluations/infrastructure/evaluation.repository';
import { AccessEngineService } from '@modules/enrollments/application/access-engine.service';
import { CreateFolderDto } from '@modules/materials/dto/create-folder.dto';
import { MaterialFolder } from '@modules/materials/domain/material-folder.entity';

@Injectable()
export class MaterialFoldersService {
  private readonly logger = new Logger(MaterialFoldersService.name);

  constructor(
    private readonly dataSource: DataSource,
    private readonly folderRepository: MaterialFolderRepository,
    private readonly folderStatusRepository: FolderStatusRepository,
    private readonly evaluationRepository: EvaluationRepository,
    private readonly accessEngine: AccessEngineService,
  ) {}

  async create(userId: string, dto: CreateFolderDto): Promise<MaterialFolder> {
    const evaluation = await this.evaluationRepository.findById(dto.evaluationId);
    if (!evaluation) {
      throw new NotFoundException('La evaluación especificada no existe.');
    }

    if (dto.parentFolderId) {
      const parent = await this.folderRepository.findById(dto.parentFolderId);
      if (!parent) {
        throw new NotFoundException('La carpeta padre no existe.');
      }
      if (parent.evaluationId !== dto.evaluationId) {
        throw new BadRequestException('La carpeta padre no pertenece a la misma evaluación.');
      }
    }

    const activeStatus = await this.folderStatusRepository.findByCode('ACTIVE');
    if (!activeStatus) {
      throw new InternalServerErrorException('Error de configuración: Estado ACTIVE no encontrado.');
    }

    return await this.dataSource.transaction(async (manager) => {
      const folder = await this.folderRepository.create({
        evaluationId: dto.evaluationId,
        parentFolderId: dto.parentFolderId || null,
        folderStatusId: activeStatus.id,
        name: dto.name,
        visibleFrom: dto.visibleFrom ? new Date(dto.visibleFrom) : null,
        visibleUntil: dto.visibleUntil ? new Date(dto.visibleUntil) : null,
        createdBy: userId,
      }, manager);

      this.logger.log({
        message: 'Carpeta de material creada',
        folderId: folder.id,
        userId,
        evaluationId: dto.evaluationId,
        timestamp: new Date().toISOString(),
      });

      return folder;
    });
  }

  async getContents(userId: string, folderId: string): Promise<MaterialFolder> {
    const folder = await this.folderRepository.findById(folderId);
    if (!folder) {
      throw new NotFoundException('Carpeta no encontrada.');
    }

    const hasAccess = await this.accessEngine.hasAccess(userId, folder.evaluationId);
    if (!hasAccess) {
      this.logger.warn({
        message: 'Acceso denegado a carpeta',
        userId,
        folderId,
        evaluationId: folder.evaluationId,
        timestamp: new Date().toISOString(),
      });
      throw new ForbiddenException('No tienes permiso para acceder a este contenido.');
    }

    return folder;
  }

  async getRootFolders(userId: string, evaluationId: string): Promise<MaterialFolder[]> {
    const hasAccess = await this.accessEngine.hasAccess(userId, evaluationId);
    if (!hasAccess) {
      throw new ForbiddenException('No tienes permiso para ver el contenido de esta evaluación.');
    }

    return await this.folderRepository.findRootsByEvaluation(evaluationId);
  }
}
