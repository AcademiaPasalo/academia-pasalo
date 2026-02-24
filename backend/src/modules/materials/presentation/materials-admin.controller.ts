import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Query,
  HttpCode,
  HttpStatus,
  Delete,
} from '@nestjs/common';
import { MaterialsAdminService } from '@modules/materials/application/materials-admin.service';
import { ReviewDeletionRequestDto } from '@modules/materials/dto/review-deletion-request.dto';
import {
  AdminMaterialFileListQueryDto,
  AdminMaterialFileListResponseDto,
} from '@modules/materials/dto/admin-material-file-list.dto';
import { Auth } from '@common/decorators/auth.decorator';
import { Roles } from '@common/decorators/roles.decorator';
import { CurrentUser } from '@common/decorators/current-user.decorator';
import { User } from '@modules/users/domain/user.entity';
import { ResponseMessage } from '@common/decorators/response-message.decorator';
import { ROLE_CODES } from '@common/constants/role-codes.constants';
import { plainToInstance } from 'class-transformer';

@Controller('admin/materials')
@Auth(ROLE_CODES.ADMIN, ROLE_CODES.SUPER_ADMIN)
export class MaterialsAdminController {
  constructor(private readonly adminService: MaterialsAdminService) {}

  @Get('files')
  @ResponseMessage('Archivos de materiales obtenidos exitosamente')
  async getFiles(@Query() query: AdminMaterialFileListQueryDto) {
    const data = await this.adminService.findMaterialFiles(query);
    return plainToInstance(AdminMaterialFileListResponseDto, data, {
      excludeExtraneousValues: true,
    });
  }

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
  @Roles(ROLE_CODES.SUPER_ADMIN)
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Material eliminado permanentemente')
  async hardDelete(@CurrentUser() user: User, @Param('id') materialId: string) {
    await this.adminService.hardDeleteMaterial(user.id, materialId);
  }
}
