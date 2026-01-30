import { Injectable, Logger, NotFoundException, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { DataSource, EntityManager } from 'typeorm';
import { DeletionRequestRepository } from '@modules/materials/infrastructure/deletion-request.repository';
import { MaterialRepository } from '@modules/materials/infrastructure/material.repository';
import { MaterialCatalogRepository } from '@modules/materials/infrastructure/material-catalog.repository';
import { DeletionRequest } from '@modules/materials/domain/deletion-request.entity';
import { DeletionReviewAction, ReviewDeletionRequestDto } from '@modules/materials/dto/review-deletion-request.dto';
import { StorageService } from '@infrastructure/storage/storage.service';

@Injectable()
export class MaterialsAdminService {
  private readonly logger = new Logger(MaterialsAdminService.name);

  constructor(
    private readonly dataSource: DataSource,
    private readonly requestRepository: DeletionRequestRepository,
    private readonly materialRepository: MaterialRepository,
    private readonly catalogRepository: MaterialCatalogRepository,
    private readonly storageService: StorageService,
  ) {}

  async findAllPendingRequests(): Promise<DeletionRequest[]> {
    const pendingStatus = await this.catalogRepository.findDeletionRequestStatusByCode('PENDING');
    if (!pendingStatus) throw new InternalServerErrorException('Configuración corrupta: Estado PENDING faltante');

    return await this.requestRepository.findByStatusId(pendingStatus.id);
  }

  async reviewRequest(adminId: string, requestId: string, dto: ReviewDeletionRequestDto): Promise<void> {
    const request = await this.requestRepository.findById(requestId);
    if (!request) throw new NotFoundException('Solicitud no encontrada');

    const pendingStatus = await this.catalogRepository.findDeletionRequestStatusByCode('PENDING');
    if (request.deletionRequestStatusId !== pendingStatus?.id) {
      throw new BadRequestException('Esta solicitud ya fue revisada');
    }

    await this.dataSource.transaction(async (manager) => {
      if (dto.action === DeletionReviewAction.APPROVE) {
        await this.handleApproval(requestId, request.entityId, adminId, manager);
      } else {
        await this.handleRejection(requestId, adminId, manager);
      }
    });

    this.logger.log({
      message: `Solicitud ${dto.action}`,
      requestId,
      adminId,
      entityId: request.entityId,
    });
  }

  private async handleApproval(requestId: string, materialId: string, adminId: string, manager: EntityManager) {
    const approvedStatus = await this.catalogRepository.findDeletionRequestStatusByCode('APPROVED');
    const archivedMaterialStatus = await this.catalogRepository.findMaterialStatusByCode('ARCHIVED');
    
    if (!approvedStatus || !archivedMaterialStatus) {
        throw new InternalServerErrorException('Estados de sistema faltantes (APPROVED/ARCHIVED)');
    }

    await manager.update(DeletionRequest, requestId, {
      deletionRequestStatusId: approvedStatus.id,
      reviewedById: adminId,
      reviewedAt: new Date(),
      updatedAt: new Date(),
    });

    // Nota: Usamos manager directamente para evitar dependencias circulares de repositorios en transacciones
    await manager.getRepository('Material').update(materialId, {
      materialStatusId: archivedMaterialStatus.id,
      visibleUntil: new Date(),
      updatedAt: new Date(),
    });
  }

  private async handleRejection(requestId: string, adminId: string, manager: EntityManager) {
    const rejectedStatus = await this.catalogRepository.findDeletionRequestStatusByCode('REJECTED');
    if (!rejectedStatus) throw new InternalServerErrorException('Estado REJECTED faltante');

    await manager.update(DeletionRequest, requestId, {
      deletionRequestStatusId: rejectedStatus.id,
      reviewedById: adminId,
      reviewedAt: new Date(),
      updatedAt: new Date(),
    });
  }

  async hardDeleteMaterial(adminId: string, materialId: string): Promise<void> {
    const material = await this.materialRepository.findById(materialId);
    if (!material) throw new NotFoundException('Material no encontrado');

    const archivedStatus = await this.catalogRepository.findMaterialStatusByCode('ARCHIVED');
    if (material.materialStatusId !== archivedStatus?.id) {
      throw new BadRequestException('Solo se pueden eliminar físicamente materiales que estén ARCHIVADOS.');
    }

    await this.dataSource.transaction(async (manager) => {
      // Obtenemos el registro antes de borrar para saber el fileVersionId
      const materialRecord = await manager.getRepository('Material').findOne({ where: { id: materialId } });
      
      await manager.getRepository('Material').delete(materialId);

      if (materialRecord && materialRecord.fileVersionId) {
        // Nota: El borrado físico del archivo en storage se podría implementar aquí si no hay más versiones
        await manager.getRepository('FileVersion').delete(materialRecord.fileVersionId);
      }
    });

    this.logger.warn({
      message: 'Material eliminado físicamente (Hard Delete)',
      materialId,
      adminId,
    });
  }
}