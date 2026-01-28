import { Controller, Post, Body, Get, Param, UseGuards, HttpStatus, HttpCode, UploadedFile, UseInterceptors, Res } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Response } from 'express';
import { MaterialsService } from '@modules/materials/application/materials.service';
import { CreateMaterialDto } from '@modules/materials/dto/create-material.dto';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { RolesGuard } from '@common/guards/roles.guard';
import { Roles } from '@common/decorators/roles.decorator';
import { CurrentUser } from '@common/decorators/current-user.decorator';
import { User } from '@modules/users/domain/user.entity';
import { ResponseMessage } from '@common/decorators/response-message.decorator';

@Controller('materials')
@UseGuards(JwtAuthGuard, RolesGuard)
export class MaterialsController {
  constructor(private readonly materialsService: MaterialsService) {}

  @Post()
  @Roles('ADMIN', 'PROFESSOR', 'SUPER_ADMIN')
  @UseInterceptors(FileInterceptor('file'))
  @HttpCode(HttpStatus.CREATED)
  @ResponseMessage('Material subido exitosamente')
  async create(
    @CurrentUser() user: User,
    @Body() dto: CreateMaterialDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new Error('No se ha adjuntado ningún archivo.');
    }
    return await this.materialsService.create(user.id, dto, file);
  }

  @Get(':id/download')
  @Roles('STUDENT', 'ADMIN', 'PROFESSOR', 'SUPER_ADMIN')
  async download(
    @CurrentUser() user: User,
    @Param('id') materialId: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { stream, fileName, mimeType } = await this.materialsService.download(user.id, materialId);
    
    res.set({
      'Content-Type': mimeType,
      'Content-Disposition': `attachment; filename="${fileName}"`,
    });

    return stream;
  }

  @Post(':id/request-deletion')
  @Roles('PROFESSOR', 'ADMIN', 'SUPER_ADMIN')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Solicitud de eliminación registrada')
  async requestDeletion(
    @CurrentUser() user: User,
    @Param('id') materialId: string,
    @Body('reason') reason: string,
  ) {
    await this.materialsService.requestDeletion(user.id, materialId, reason);
  }
}
