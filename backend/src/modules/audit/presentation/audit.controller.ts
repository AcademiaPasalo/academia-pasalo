import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AuditService } from '@modules/audit/application/audit.service';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { RolesGuard } from '@common/guards/roles.guard';
import { Roles } from '@common/decorators/roles.decorator';
import { ResponseMessage } from '@common/decorators/response-message.decorator';

@Controller('audit')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get('history')
  @Roles('SUPER_ADMIN', 'ADMIN')
  @ResponseMessage('Historial de auditoría recuperado exitosamente')
  async getHistory(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('userId') userId?: string,
    @Query('limit') limit?: number,
  ) {
    return await this.auditService.getUnifiedHistory({
      startDate,
      endDate,
      userId,
      limit: limit ? Number(limit) : undefined,
    });
  }
}
