import { Controller, Post, Body, Get, Param, UseGuards, HttpStatus, HttpCode } from '@nestjs/common';
import { MaterialFoldersService } from '@modules/materials/application/material-folders.service';
import { CreateFolderDto } from '@modules/materials/dto/create-folder.dto';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { RolesGuard } from '@common/guards/roles.guard';
import { Roles } from '@common/decorators/roles.decorator';
import { CurrentUser } from '@common/decorators/current-user.decorator';
import { User } from '@modules/users/domain/user.entity';
import { ResponseMessage } from '@common/decorators/response-message.decorator';

@Controller('materials/folders')
@UseGuards(JwtAuthGuard, RolesGuard)
export class MaterialFoldersController {
  constructor(private readonly folderService: MaterialFoldersService) {}

  @Post()
  @Roles('ADMIN', 'PROFESSOR', 'SUPER_ADMIN')
  @HttpCode(HttpStatus.CREATED)
  @ResponseMessage('Carpeta creada exitosamente')
  async create(@CurrentUser() user: User, @Body() dto: CreateFolderDto) {
    return await this.folderService.create(user.id, dto);
  }

  @Get('evaluation/:id')
  @Roles('STUDENT', 'ADMIN', 'PROFESSOR', 'SUPER_ADMIN')
  @ResponseMessage('Contenido raíz obtenido exitosamente')
  async getRoots(@CurrentUser() user: User, @Param('id') evaluationId: string) {
    return await this.folderService.getRootFolders(user.id, evaluationId);
  }

  @Get(':id')
  @Roles('STUDENT', 'ADMIN', 'PROFESSOR', 'SUPER_ADMIN')
  @ResponseMessage('Contenido de carpeta obtenido exitosamente')
  async getContents(@CurrentUser() user: User, @Param('id') folderId: string) {
    return await this.folderService.getContents(user.id, folderId);
  }
}
