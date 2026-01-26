import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { MaterialsService } from '@modules/materials/application/materials.service';
import { CreateFolderDto } from '@modules/materials/dto/create-folder.dto';
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

  @Post('folders')
  @Roles('ADMIN', 'SUPER_ADMIN')
  @HttpCode(HttpStatus.CREATED)
  @ResponseMessage('Carpeta creada exitosamente')
  async createFolder(@Body() dto: CreateFolderDto, @CurrentUser() user: User) {
    return await this.materialsService.createFolder(dto, user.id);
  }

  @Get('folders/evaluation/:id')
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ResponseMessage('Estructura de carpetas obtenida exitosamente')
  async getFoldersByEvaluation(@Param('id') id: string) {
    return await this.materialsService.getFoldersByEvaluation(id);
  }
}
