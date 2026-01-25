import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from '@modules/users/application/users.service';
import { UsersController } from '@modules/users/presentation/users.controller';
import { User } from '@modules/users/domain/user.entity';
import { Role } from '@modules/users/domain/role.entity';
import { UserRepository } from '@modules/users/infrastructure/user.repository';
import { RoleRepository } from '@modules/users/infrastructure/role.repository';

@Module({
  imports: [TypeOrmModule.forFeature([User, Role])],
  controllers: [UsersController],
  providers: [UsersService, UserRepository, RoleRepository],
  exports: [UsersService, UserRepository, RoleRepository],
})
export class UsersModule {}
