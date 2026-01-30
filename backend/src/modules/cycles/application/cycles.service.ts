import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { AcademicCycleRepository } from '@modules/cycles/infrastructure/academic-cycle.repository';
import { AuthSettingsService } from '@modules/auth/application/auth-settings.service';
import { AcademicCycle } from '@modules/cycles/domain/academic-cycle.entity';

@Injectable()
export class CyclesService {
  private readonly logger = new Logger(CyclesService.name);

  constructor(
    private readonly academicCycleRepository: AcademicCycleRepository,
    private readonly authSettingsService: AuthSettingsService,
  ) {}

  async findAll(): Promise<AcademicCycle[]> {
    return await this.academicCycleRepository.findAll();
  }

  async findOne(id: string): Promise<AcademicCycle> {
    const cycle = await this.academicCycleRepository.findById(id);
    if (!cycle) {
      this.logger.warn({
        message: 'Consulta de ciclo inexistente',
        cycleId: id,
        timestamp: new Date().toISOString(),
      });
      throw new NotFoundException('El ciclo académico solicitado no existe.');
    }
    return cycle;
  }

  async getActiveCycle(): Promise<AcademicCycle> {
    try {
      const activeCycleId = await this.authSettingsService.getActiveCycleId();
      return await this.findOne(activeCycleId);
    } catch (error) {
      this.logger.error({
        message: 'Error al determinar el ciclo activo',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      });
      throw new NotFoundException('No se ha podido identificar el ciclo activo del sistema.');
    }
  }
}
