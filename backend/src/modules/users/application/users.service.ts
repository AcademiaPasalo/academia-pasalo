import {
  Injectable,
  NotFoundException,
  ConflictException,
  ServiceUnavailableException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { DataSource } from 'typeorm';
import { User } from '@modules/users/domain/user.entity';
import { UserRepository } from '@modules/users/infrastructure/user.repository';
import { RoleRepository } from '@modules/users/infrastructure/role.repository';
import { CreateUserDto } from '@modules/users/dto/create-user.dto';
import { UpdateUserDto } from '@modules/users/dto/update-user.dto';
import { IdentitySecurityService } from '@modules/users/application/identity-security.service';
import { IDENTITY_INVALIDATION_REASONS } from '@modules/auth/interfaces/security.constants';
import {
  DatabaseError,
  MySqlErrorCode,
} from '@common/interfaces/database-error.interface';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    private readonly dataSource: DataSource,
    private readonly userRepository: UserRepository,
    private readonly roleRepository: RoleRepository,
    private readonly identitySecurityService: IdentitySecurityService,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const existingUser = await this.userRepository.findByEmail(
      createUserDto.email,
    );

    if (existingUser) {
      throw new ConflictException('El correo electrónico ya está registrado');
    }

    const now = new Date();
    try {
      return await this.userRepository.create({
        ...createUserDto,
        createdAt: now,
        updatedAt: null,
      });
    } catch (error) {
      const dbError = error as DatabaseError;
      const errno = dbError.errno ?? dbError.driverError?.errno;
      if (errno === MySqlErrorCode.DUPLICATE_ENTRY) {
        throw new ConflictException('El correo electrónico ya está registrado');
      }
      throw error;
    }
  }

  async findAll(): Promise<User[]> {
    return await this.userRepository.findAll();
  }

  async findOne(id: string): Promise<User> {
    const user = await this.userRepository.findById(id);

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return await this.userRepository.findByEmail(email);
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    return await this.dataSource.transaction(async (manager) => {
      const user = await this.userRepository.findById(id, manager);
      if (!user) {
        throw new NotFoundException('Usuario no encontrado');
      }

      const shouldInvalidateIdentity = this.shouldInvalidateIdentityOnUpdate(
        user,
        updateUserDto,
      );
      const shouldRevokeSessions =
        updateUserDto.isActive === false && user.isActive !== false;

      if (updateUserDto.email && updateUserDto.email !== user.email) {
        const existingUser = await this.userRepository.findByEmail(
          updateUserDto.email,
          manager,
        );

        if (existingUser) {
          throw new ConflictException(
            'El correo electrónico ya está registrado',
          );
        }
      }

      Object.assign(user, updateUserDto);
      user.updatedAt = new Date();

      let updatedUser: User;
      try {
        updatedUser = await this.userRepository.save(user, manager);
      } catch (error) {
        const dbError = error as DatabaseError;
        const errno = dbError.errno ?? dbError.driverError?.errno;
        if (errno === MySqlErrorCode.DUPLICATE_ENTRY) {
          throw new ConflictException(
            'El correo electrónico ya está registrado',
          );
        }
        throw error;
      }

      if (shouldInvalidateIdentity) {
        await this.identitySecurityService.invalidateUserIdentity(id, {
          revokeSessions: shouldRevokeSessions,
          reason: shouldRevokeSessions
            ? IDENTITY_INVALIDATION_REASONS.USER_BANNED
            : IDENTITY_INVALIDATION_REASONS.SENSITIVE_UPDATE,
          manager,
        });
      }

      return updatedUser;
    });
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id);
    await this.userRepository.delete(id);
  }

  async assignRole(userId: string, roleCode: string): Promise<User> {
    return await this.dataSource.transaction(async (manager) => {
      const user = await this.userRepository.findById(userId, manager);
      if (!user) {
        throw new NotFoundException('Usuario no encontrado');
      }

      const role = await this.roleRepository.findByCode(roleCode, manager);
      if (!role) {
        throw new NotFoundException(`Rol ${roleCode} no encontrado`);
      }

      const hasRole = user.roles.some((r) => r.code === roleCode);
      if (hasRole) {
        throw new ConflictException('El usuario ya tiene este rol asignado');
      }

      user.roles.push(role);
      user.updatedAt = new Date();

      let updatedUser: User;
      try {
        updatedUser = await this.userRepository.save(user, manager);
      } catch (error) {
        const dbError = error as DatabaseError;
        const errno = dbError.errno ?? dbError.driverError?.errno;
        if (errno === MySqlErrorCode.DUPLICATE_ENTRY) {
          throw new ConflictException('El usuario ya tiene este rol asignado');
        }
        throw error;
      }

      this.logger.log({
        level: 'info',
        context: UsersService.name,
        message: 'Rol asignado al usuario',
        userId,
        roleCode,
      });

      await this.identitySecurityService.invalidateUserIdentity(userId, {
        revokeSessions: false,
        reason: IDENTITY_INVALIDATION_REASONS.ROLE_CHANGE,
        manager,
      });

      return updatedUser;
    });
  }

  async removeRole(userId: string, roleCode: string): Promise<User> {
    return await this.dataSource.transaction(async (manager) => {
      const user = await this.userRepository.findById(userId, manager);
      if (!user) {
        throw new NotFoundException('Usuario no encontrado');
      }

      const roleIndex = user.roles.findIndex((r) => r.code === roleCode);
      if (roleIndex === -1) {
        throw new NotFoundException('El usuario no tiene este rol asignado');
      }

      user.roles.splice(roleIndex, 1);
      user.updatedAt = new Date();

      let updatedUser: User;
      try {
        updatedUser = await this.userRepository.save(user, manager);
      } catch (error) {
        const dbError = error as DatabaseError;
        const errno = dbError.errno ?? dbError.driverError?.errno;

        if (
          errno === MySqlErrorCode.LOCK_WAIT_TIMEOUT ||
          errno === MySqlErrorCode.DEADLOCK
        ) {
          throw new ServiceUnavailableException(
            'La operación no pudo completarse por alta concurrencia. Intente nuevamente.',
          );
        }

        if (errno === MySqlErrorCode.FOREIGN_KEY_CONSTRAINT_FAIL) {
          throw new ConflictException(
            'No se pudo remover el rol por restricciones de integridad.',
          );
        }

        throw new InternalServerErrorException(
          'No se pudo remover el rol. Intente nuevamente.',
        );
      }

      this.logger.log({
        level: 'info',
        context: UsersService.name,
        message: 'Rol removido del usuario',
        userId,
        roleCode,
      });

      await this.identitySecurityService.invalidateUserIdentity(userId, {
        revokeSessions: false,
        reason: IDENTITY_INVALIDATION_REASONS.ROLE_CHANGE,
        manager,
      });

      return updatedUser;
    });
  }

  private shouldInvalidateIdentityOnUpdate(
    currentUser: User,
    updateUserDto: UpdateUserDto,
  ): boolean {
    if (
      typeof updateUserDto.email === 'string' &&
      updateUserDto.email !== currentUser.email
    ) {
      return true;
    }

    if (
      typeof updateUserDto.isActive === 'boolean' &&
      updateUserDto.isActive !== currentUser.isActive
    ) {
      return true;
    }

    return false;
  }
}
