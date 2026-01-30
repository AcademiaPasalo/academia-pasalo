import { Controller, Post, Body, Get, Param, HttpStatus, HttpCode, UploadedFile, UseInterceptors, Res, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { MaterialsService } from '@modules/materials/application/materials.service';
import { UploadMaterialDto } from '@modules/materials/dto/upload-material.dto';
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
