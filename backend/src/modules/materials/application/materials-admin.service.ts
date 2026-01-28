import { Injectable, Logger, NotFoundException, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { DataSource, EntityManager } from 'typeorm';
import { DeletionRequestRepository } from '@modules/materials/infrastructure/deletion-request.repository';
import { DeletionRequestStatusRepository } from '@modules/materials/infrastructure/deletion-request-status.repository';
import { MaterialRepository } from '@modules/materials/infrastructure/material.repository';
import { MaterialStatusRepository } from '@modules/materials/infrastructure/material-status.repository';
import { DeletionRequest } from '@modules/materials/domain/deletion-request.entity';
import { DeletionReviewAction, ReviewDeletionRequestDto } from '@modules/materials/dto/review-deletion-request.dto';
import { StorageService } from '@infrastructure/storage/storage.service';

@Injectable()
export class MaterialsAdminService {
  private readonly logger = new Logger(MaterialsAdminService.name);

  constructor(
    private readonly dataSource: DataSource,
    private readonly requestRepository: DeletionRequestRepository,
    private readonly requestStatusRepository: DeletionRequestStatusRepository,
    private readonly materialRepository: MaterialRepository,
    private readonly materialStatusRepository: MaterialStatusRepository,
    private readonly storageService: StorageService,
  ) {}

  async findAllPendingRequests(): Promise<DeletionRequest[]> {
    const pendingStatus = await this.requestStatusRepository.findByCode('PENDING');
    if (!pendingStatus) throw new InternalServerErrorException('Configuración corrupta: Estado PENDING faltante');

    return await this.requestRepository.findAllByStatus(pendingStatus.id);
  }

  async reviewRequest(adminId: string, requestId: string, dto: ReviewDeletionRequestDto): Promise<void> {
    const request = await this.requestRepository.findById(requestId);
    if (!request) throw new NotFoundException('Solicitud no encontrada');

    const pendingStatus = await this.requestStatusRepository.findByCode('PENDING');
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
    const approvedStatus = await this.requestStatusRepository.findByCode('APPROVED');
    const archivedMaterialStatus = await this.materialStatusRepository.findByCode('ARCHIVED');
    
    if (!approvedStatus || !archivedMaterialStatus) {
        throw new InternalServerErrorException('Estados de sistema faltantes (APPROVED/ARCHIVED)');
    }

    // 1. Actualizar solicitud
    await manager.getRepository('DeletionRequest').update(requestId, {
      deletionRequestStatusId: approvedStatus.id,
      reviewedById: adminId,
      reviewedAt: new Date(),
      updatedAt: new Date(),
    });

    // 2. Archivar material (Soft Delete lógico)
    await manager.getRepository('Material').update(materialId, {
      materialStatusId: archivedMaterialStatus.id,
      visibleUntil: new Date(), // Ocultar inmediatamente
      updatedAt: new Date(),
    });
  }

  private async handleRejection(requestId: string, adminId: string, manager: EntityManager) {
    const rejectedStatus = await this.requestStatusRepository.findByCode('REJECTED');
    if (!rejectedStatus) throw new InternalServerErrorException('Estado REJECTED faltante');

    await manager.getRepository('DeletionRequest').update(requestId, {
      deletionRequestStatusId: rejectedStatus.id,
      reviewedById: adminId,
      reviewedAt: new Date(),
      updatedAt: new Date(),
    });
  }

  async hardDeleteMaterial(adminId: string, materialId: string): Promise<void> {
    const material = await this.materialRepository.findById(materialId);
    if (!material) throw new NotFoundException('Material no encontrado');

    const archivedStatus = await this.materialStatusRepository.findByCode('ARCHIVED');
    if (material.materialStatusId !== archivedStatus?.id) {
      throw new BadRequestException('Solo se pueden eliminar físicamente materiales que estén ARCHIVADOS.');
    }

    // Operación Destructiva: Transacción necesaria para consistencia BD vs Disco
    await this.dataSource.transaction(async (manager) => {
      // 1. Borrar de BD
      await manager.getRepository('Material').delete(materialId);
      
      // Nota: Aquí deberíamos borrar también FileVersion y FileResource si ya no se usan.
      // Por simplicidad en esta fase, asumimos que FileResource podría ser compartido.
      // Si queremos limpiar disco, necesitamos verificar uso.
      // Para este MVP profesional, mantendremos el recurso físico por auditoría o implementaremos limpieza en job aparte.
      // PERO, si la regla es "Hard Delete", se espera borrado físico.
      // Como FileResource es inmutable y compartido, borrarlo requiere cuidado.
      // Decisión de diseño: Hard Delete solo borra el metadato del material en este contexto, 
      // dejando el archivo huérfano para limpieza por Job, O borramos si es la única referencia.
      
      // Dado que no tenemos implementación de conteo de referencias aún, 
      // solo borramos el registro lógico 'Material'.
    });

    this.logger.warn({
      message: 'Material eliminado físicamente (Hard Delete)',
      materialId,
      adminId,
    });
  }
}
