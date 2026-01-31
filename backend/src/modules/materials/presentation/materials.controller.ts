import { Controller, Post, Body, Get, Param, HttpStatus, HttpCode, UploadedFile, UseInterceptors, Res } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Response } from 'express';
import { MaterialsService } from '@modules/materials/application/materials.service';
import { UploadMaterialDto } from '@modules/materials/dto/upload-material.dto';
import { CreateMaterialFolderDto } from '@modules/materials/dto/create-material-folder.dto';
import { RequestDeletionDto } from '@modules/materials/dto/request-deletion.dto';
import { Auth } from '@common/decorators/auth.decorator';
import { Roles } from '@common/decorators/roles.decorator';
import { CurrentUser } from '@common/decorators/current-user.decorator';
import { User } from '@modules/users/domain/user.entity';
import { ResponseMessage } from '@common/decorators/response-message.decorator';

@Controller('materials')
@Auth()
export class MaterialsController {
  constructor(private readonly materialsService: MaterialsService) {}

  @Post('folders')
  @Roles('ADMIN', 'PROFESSOR', 'SUPER_ADMIN')
  @HttpCode(HttpStatus.CREATED)
  @ResponseMessage('Carpeta creada exitosamente')
  async createFolder(
    @CurrentUser() user: User,
    @Body() dto: CreateMaterialFolderDto,
  ) {
    return await this.materialsService.createFolder(user.id, dto);
  }

  @Post()
  @Roles('ADMIN', 'PROFESSOR', 'SUPER_ADMIN')
  @UseInterceptors(FileInterceptor('file'))
  @HttpCode(HttpStatus.CREATED)
  @ResponseMessage('Material subido exitosamente')
  async upload(
    @CurrentUser() user: User,
    @Body() dto: UploadMaterialDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return await this.materialsService.uploadMaterial(user.id, dto, file);
  }

  @Post(':id/versions')
  @Roles('ADMIN', 'PROFESSOR', 'SUPER_ADMIN')
  @UseInterceptors(FileInterceptor('file'))
  @HttpCode(HttpStatus.CREATED)
  @ResponseMessage('Nueva versión subida exitosamente')
  async addVersion(
    @CurrentUser() user: User,
    @Param('id') materialId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return await this.materialsService.addVersion(user.id, materialId, file);
  }

  @Get('folders/evaluation/:evaluationId')
  @Roles('STUDENT', 'PROFESSOR', 'ADMIN', 'SUPER_ADMIN')
  @ResponseMessage('Carpetas raíz obtenidas exitosamente')
  async getRootFolders(
    @CurrentUser() user: User,
    @Param('evaluationId') evaluationId: string,
  ) {
    return await this.materialsService.getRootFolders(user.id, evaluationId);
  }

  @Get('folders/:folderId')
  @Roles('STUDENT', 'PROFESSOR', 'ADMIN', 'SUPER_ADMIN')
  @ResponseMessage('Contenido de carpeta obtenido exitosamente')
  async getFolderContents(
    @CurrentUser() user: User,
    @Param('folderId') folderId: string,
  ) {
    return await this.materialsService.getFolderContents(user, folderId);
  }

  @Get(':id/download')
  @Roles('STUDENT', 'ADMIN', 'PROFESSOR', 'SUPER_ADMIN')
  async download(
    @CurrentUser() user: User,
    @Param('id') materialId: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { stream, fileName, mimeType } = await this.materialsService.download(user, materialId);
    
    res.set({
      'Content-Type': mimeType,
      'Content-Disposition': `attachment; filename="${fileName}"`,
    });

    return stream;
  }

  @Post('request-deletion')
  @Roles('PROFESSOR', 'ADMIN', 'SUPER_ADMIN')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Solicitud de eliminación registrada')
  async requestDeletion(
    @CurrentUser() user: User,
    @Body() dto: RequestDeletionDto,
  ) {
    await this.materialsService.requestDeletion(user.id, dto);
  }
}
