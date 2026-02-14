import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
  ForbiddenException,
} from '@nestjs/common';
import { UsersService } from '@modules/users/application/users.service';
import { CreateUserDto } from '@modules/users/dto/create-user.dto';
import { UpdateUserDto } from '@modules/users/dto/update-user.dto';
import { UserResponseDto } from '@modules/users/dto/user-response.dto';
import { ResponseMessage } from '@common/decorators/response-message.decorator';
import { plainToInstance } from 'class-transformer';
import { Auth } from '@common/decorators/auth.decorator';
import { Roles } from '@common/decorators/roles.decorator';
import { CurrentUser } from '@common/decorators/current-user.decorator';
import { User } from '@modules/users/domain/user.entity';
import {
  ADMIN_ROLE_CODES,
  ROLE_CODES,
} from '@common/constants/role-codes.constants';

@Controller('users')
@Auth()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @Roles(ROLE_CODES.ADMIN, ROLE_CODES.SUPER_ADMIN)
  @HttpCode(HttpStatus.CREATED)
  @ResponseMessage('Usuario creado exitosamente')
  async create(@Body() createUserDto: CreateUserDto) {
    const user = await this.usersService.create(createUserDto);
    return plainToInstance(UserResponseDto, user, {
      excludeExtraneousValues: true,
    });
  }

  @Get()
  @Roles(ROLE_CODES.ADMIN, ROLE_CODES.SUPER_ADMIN)
  @ResponseMessage('Usuarios obtenidos exitosamente')
  async findAll() {
    const users = await this.usersService.findAll();
    return users.map((user) =>
      plainToInstance(UserResponseDto, user, {
        excludeExtraneousValues: true,
      }),
    );
  }

  @Get(':id')
  @ResponseMessage('Usuario obtenido exitosamente')
  async findOne(@Param('id') id: string, @CurrentUser() currentUser: User) {
    const isAdmin = currentUser.roles.some((r) =>
      ADMIN_ROLE_CODES.includes(r.code),
    );

    if (!isAdmin && currentUser.id !== id) {
      throw new ForbiddenException(
        'No tienes permiso para acceder a este perfil',
      );
    }

    const user = await this.usersService.findOne(id);
    return plainToInstance(UserResponseDto, user, {
      excludeExtraneousValues: true,
    });
  }

  @Patch(':id')
  @ResponseMessage('Usuario actualizado exitosamente')
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @CurrentUser() currentUser: User,
  ) {
    const isAdmin = currentUser.roles.some((r) =>
      ADMIN_ROLE_CODES.includes(r.code),
    );

    if (!isAdmin && currentUser.id !== id) {
      throw new ForbiddenException(
        'No tienes permiso para actualizar este perfil',
      );
    }

    let finalUpdateDto = updateUserDto;

    if (!isAdmin) {
      finalUpdateDto = plainToInstance(UpdateUserDto, {
        profilePhotoUrl: updateUserDto.profilePhotoUrl,
        photoSource: updateUserDto.photoSource,
      });
    }

    const user = await this.usersService.update(id, finalUpdateDto);
    return plainToInstance(UserResponseDto, user, {
      excludeExtraneousValues: true,
    });
  }

  @Patch(':id/ban')
  @Roles(ROLE_CODES.ADMIN, ROLE_CODES.SUPER_ADMIN)
  @ResponseMessage('Usuario baneado exitosamente')
  async banUser(@Param('id') id: string, @CurrentUser() currentUser: User) {
    if (currentUser.id === id) {
      throw new ForbiddenException('No puedes banear tu propia cuenta');
    }

    const user = await this.usersService.update(id, { isActive: false });
    return plainToInstance(UserResponseDto, user, {
      excludeExtraneousValues: true,
    });
  }

  @Delete(':id')
  @Roles(ROLE_CODES.ADMIN, ROLE_CODES.SUPER_ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ResponseMessage('Usuario eliminado exitosamente')
  async remove(@Param('id') id: string) {
    await this.usersService.remove(id);
  }

  @Post(':id/roles/:roleCode')
  @Roles(ROLE_CODES.SUPER_ADMIN)
  @ResponseMessage('Rol asignado exitosamente')
  async assignRole(
    @Param('id') id: string,
    @Param('roleCode') roleCode: string,
  ) {
    const user = await this.usersService.assignRole(id, roleCode);
    return plainToInstance(UserResponseDto, user, {
      excludeExtraneousValues: true,
    });
  }

  @Delete(':id/roles/:roleCode')
  @Roles(ROLE_CODES.SUPER_ADMIN)
  @ResponseMessage('Rol removido exitosamente')
  async removeRole(
    @Param('id') id: string,
    @Param('roleCode') roleCode: string,
  ) {
    const user = await this.usersService.removeRole(id, roleCode);
    return plainToInstance(UserResponseDto, user, {
      excludeExtraneousValues: true,
    });
  }
}
