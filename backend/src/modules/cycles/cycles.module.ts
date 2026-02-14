import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AcademicCycle } from '@modules/cycles/domain/academic-cycle.entity';
import { AcademicCycleRepository } from '@modules/cycles/infrastructure/academic-cycle.repository';
import { CyclesService } from '@modules/cycles/application/cycles.service';
import { CyclesController } from '@modules/cycles/presentation/cycles.controller';
import { AuthModule } from '@modules/auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([AcademicCycle]), AuthModule],
  controllers: [CyclesController],
  providers: [AcademicCycleRepository, CyclesService],
  exports: [AcademicCycleRepository, CyclesService],
})
export class CyclesModule {}
