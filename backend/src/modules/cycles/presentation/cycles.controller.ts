import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { CyclesService } from '@modules/cycles/application/cycles.service';
import { AcademicCycleResponseDto } from '@modules/cycles/dto/academic-cycle-response.dto';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { RolesGuard } from '@common/guards/roles.guard';
import { Roles } from '@common/decorators/roles.decorator';
import { ResponseMessage } from '@common/decorators/response-message.decorator';
import { plainToInstance } from 'class-transformer';

@Controller('cycles')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CyclesController {
  constructor(private readonly cyclesService: CyclesService) {}

  @Get()
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ResponseMessage('Ciclos académicos obtenidos exitosamente')
  async findAll() {
    const cycles = await this.cyclesService.findAll();
    return plainToInstance(AcademicCycleResponseDto, cycles, {
      excludeExtraneousValues: true,
    });
  }

  @Get('active')
  @ResponseMessage('Ciclo académico activo obtenido exitosamente')
  async findActive() {
    const cycle = await this.cyclesService.getActiveCycle();
    return plainToInstance(AcademicCycleResponseDto, cycle, {
      excludeExtraneousValues: true,
    });
  }

  @Get(':id')
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ResponseMessage('Ciclo académico obtenido exitosamente')
  async findOne(@Param('id') id: string) {
    const cycle = await this.cyclesService.findOne(id);
    return plainToInstance(AcademicCycleResponseDto, cycle, {
      excludeExtraneousValues: true,
    });
  }
}
