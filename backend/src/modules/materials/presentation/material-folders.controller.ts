import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { MaterialsService } from '@modules/materials/application/materials.service';
import { CreateMaterialFolderDto } from '@modules/materials/dto/create-material-folder.dto';
import { Auth } from '@common/decorators/auth.decorator';
import { Roles } from '@common/decorators/roles.decorator';
import { CurrentUser } from '@common/decorators/current-user.decorator';
import { User } from '@modules/users/domain/user.entity';
import { ResponseMessage } from '@common/decorators/response-message.decorator';

@Controller('materials/folders')
@Auth()
export class MaterialFoldersController {
  constructor(private readonly materialsService: MaterialsService) {}

  @Post()
  @Roles('ADMIN', 'PROFESSOR', 'SUPER_ADMIN')
  @HttpCode(HttpStatus.CREATED)
  @ResponseMessage('Carpeta creada exitosamente')
  async create(
    @CurrentUser() user: User,
    @Body() dto: CreateMaterialFolderDto,
  ) {
    return await this.materialsService.createFolder(user.id, dto);
  }

  @Get('evaluation/:id')
  @Roles('STUDENT', 'ADMIN', 'PROFESSOR', 'SUPER_ADMIN')
  @ResponseMessage('Contenido raíz obtenido exitosamente')
  async getRoots(@CurrentUser() user: User, @Param('id') evaluationId: string) {
    return await this.materialsService.getRootFolders(user.id, evaluationId);
  }

  @Get(':id')
  @Roles('STUDENT', 'ADMIN', 'PROFESSOR', 'SUPER_ADMIN')
  @ResponseMessage('Contenido de carpeta obtenido exitosamente')
  async getContents(@CurrentUser() user: User, @Param('id') folderId: string) {
    return await this.materialsService.getFolderContents(user, folderId);
  }
}
