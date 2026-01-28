import { Controller, Get, Post, Param, Body, UseGuards, HttpCode, HttpStatus, Delete } from '@nestjs/common';
import { MaterialsAdminService } from '@modules/materials/application/materials-admin.service';
import { ReviewDeletionRequestDto } from '@modules/materials/dto/review-deletion-request.dto';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { RolesGuard } from '@common/guards/roles.guard';
import { Roles } from '@common/decorators/roles.decorator';
import { CurrentUser } from '@common/decorators/current-user.decorator';
import { User } from '@modules/users/domain/user.entity';
import { ResponseMessage } from '@common/decorators/response-message.decorator';

@Controller('admin/materials')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN', 'SUPER_ADMIN')
export class MaterialsAdminController {
  constructor(private readonly adminService: MaterialsAdminService) {}

  @Get('requests/pending')
  @ResponseMessage('Solicitudes pendientes obtenidas exitosamente')
  async getPendingRequests() {
    return await this.adminService.findAllPendingRequests();
  }

  @Post('requests/:id/review')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Solicitud procesada exitosamente')
  async reviewRequest(
    @CurrentUser() user: User,
    @Param('id') requestId: string,
    @Body() dto: ReviewDeletionRequestDto,
  ) {
    await this.adminService.reviewRequest(user.id, requestId, dto);
  }

  @Delete(':id/hard-delete')
  @Roles('SUPER_ADMIN') // Solo Super Admin para borrado físico
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Material eliminado permanentemente')
  async hardDelete(@CurrentUser() user: User, @Param('id') materialId: string) {
    await this.adminService.hardDeleteMaterial(user.id, materialId);
  }
}
