import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from '@modules/users/application/users.service';
import { IdentitySecurityService } from '@modules/users/application/identity-security.service';
import { UsersController } from '@modules/users/presentation/users.controller';
import { User } from '@modules/users/domain/user.entity';
import { Role } from '@modules/users/domain/role.entity';
import { UserSession } from '@modules/auth/domain/user-session.entity';
import { SessionStatus } from '@modules/auth/domain/session-status.entity';
import { UserRepository } from '@modules/users/infrastructure/user.repository';
import { RoleRepository } from '@modules/users/infrastructure/role.repository';
import { UserSessionRepository } from '@modules/auth/infrastructure/user-session.repository';
import { SessionStatusRepository } from '@modules/auth/infrastructure/session-status.repository';
import { RedisCacheModule } from '@infrastructure/cache/redis-cache.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Role, UserSession, SessionStatus]),
    RedisCacheModule,
  ],
  controllers: [UsersController],
  providers: [
    UsersService,
    IdentitySecurityService,
    UserRepository,
    RoleRepository,
    UserSessionRepository,
    SessionStatusRepository,
  ],
  exports: [
    UsersService,
    IdentitySecurityService,
    UserRepository,
    RoleRepository,
  ],
})
export class UsersModule {}
