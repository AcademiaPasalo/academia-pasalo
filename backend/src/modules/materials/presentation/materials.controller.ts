import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  HttpStatus,
  HttpCode,
  UploadedFile,
  UseInterceptors,
  Res,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Response } from 'express';
import { MaterialsService } from '@modules/materials/application/materials.service';
import { UploadMaterialDto } from '@modules/materials/dto/upload-material.dto';
import { CreateMaterialFolderDto } from '@modules/materials/dto/create-material-folder.dto';
import { RequestDeletionDto } from '@modules/materials/dto/request-deletion.dto';
import { Auth } from '@common/decorators/auth.decorator';
import { Roles } from '@common/decorators/roles.decorator';
import { CurrentUser } from '@common/decorators/current-user.decorator';
import type { UserWithSession } from '@modules/auth/strategies/jwt.strategy';
import { ResponseMessage } from '@common/decorators/response-message.decorator';
import { ROLE_CODES } from '@common/constants/role-codes.constants';

@Controller('materials')
@Auth()
export class MaterialsController {
  constructor(private readonly materialsService: MaterialsService) {}

  @Post('folders')
  @Roles(ROLE_CODES.ADMIN, ROLE_CODES.PROFESSOR, ROLE_CODES.SUPER_ADMIN)
  @HttpCode(HttpStatus.CREATED)
  @ResponseMessage('Carpeta creada exitosamente')
  async createFolder(
    @CurrentUser() user: UserWithSession,
    @Body() dto: CreateMaterialFolderDto,
  ) {
    return await this.materialsService.createFolder(user, dto);
  }

  @Post()
  @Roles(ROLE_CODES.ADMIN, ROLE_CODES.PROFESSOR, ROLE_CODES.SUPER_ADMIN)
  @UseInterceptors(FileInterceptor('file'))
  @HttpCode(HttpStatus.CREATED)
  @ResponseMessage('Material subido exitosamente')
  async upload(
    @CurrentUser() user: UserWithSession,
    @Body() dto: UploadMaterialDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return await this.materialsService.uploadMaterial(user, dto, file);
  }

  @Post(':id/versions')
  @Roles(ROLE_CODES.ADMIN, ROLE_CODES.PROFESSOR, ROLE_CODES.SUPER_ADMIN)
  @UseInterceptors(FileInterceptor('file'))
  @HttpCode(HttpStatus.CREATED)
  @ResponseMessage('Nueva versión subida exitosamente')
  async addVersion(
    @CurrentUser() user: UserWithSession,
    @Param('id') materialId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return await this.materialsService.addVersion(user, materialId, file);
  }

  @Get('folders/evaluation/:evaluationId')
  @Roles(
    ROLE_CODES.STUDENT,
    ROLE_CODES.PROFESSOR,
    ROLE_CODES.ADMIN,
    ROLE_CODES.SUPER_ADMIN,
  )
  @ResponseMessage('Carpetas raíz obtenidas exitosamente')
  async getRootFolders(
    @CurrentUser() user: UserWithSession,
    @Param('evaluationId') evaluationId: string,
  ) {
    return await this.materialsService.getRootFolders(user, evaluationId);
  }

  @Get('folders/:folderId')
  @Roles(
    ROLE_CODES.STUDENT,
    ROLE_CODES.PROFESSOR,
    ROLE_CODES.ADMIN,
    ROLE_CODES.SUPER_ADMIN,
  )
  @ResponseMessage('Contenido de carpeta obtenido exitosamente')
  async getFolderContents(
    @CurrentUser() user: UserWithSession,
    @Param('folderId') folderId: string,
  ) {
    return await this.materialsService.getFolderContents(user, folderId);
  }

  @Get('class-event/:classEventId')
  @Roles(
    ROLE_CODES.STUDENT,
    ROLE_CODES.PROFESSOR,
    ROLE_CODES.ADMIN,
    ROLE_CODES.SUPER_ADMIN,
  )
  @ResponseMessage('Materiales de sesion obtenidos exitosamente')
  async getClassEventMaterials(
    @CurrentUser() user: UserWithSession,
    @Param('classEventId') classEventId: string,
  ) {
    return await this.materialsService.getClassEventMaterials(
      user,
      classEventId,
    );
  }

  @Get(':id/download')
  @Roles(
    ROLE_CODES.STUDENT,
    ROLE_CODES.ADMIN,
    ROLE_CODES.PROFESSOR,
    ROLE_CODES.SUPER_ADMIN,
  )
  async download(
    @CurrentUser() user: UserWithSession,
    @Param('id') materialId: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { stream, fileName, mimeType } = await this.materialsService.download(
      user,
      materialId,
    );

    res.set({
      'Content-Type': mimeType,
      'Content-Disposition': `attachment; filename="${fileName}"`,
    });

    return stream;
  }

  @Post('request-deletion')
  @Roles(ROLE_CODES.PROFESSOR, ROLE_CODES.ADMIN, ROLE_CODES.SUPER_ADMIN)
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Solicitud de eliminación registrada')
  async requestDeletion(
    @CurrentUser() user: UserWithSession,
    @Body() dto: RequestDeletionDto,
  ) {
    await this.materialsService.requestDeletion(user, dto);
  }
}
