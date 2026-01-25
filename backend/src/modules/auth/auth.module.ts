import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthService } from '@modules/auth/application/auth.service';
import { AuthSettingsService } from '@modules/auth/application/auth-settings.service';
import { SessionService } from '@modules/auth/application/session.service';
import { GeolocationService } from '@modules/auth/application/geolocation.service';
import { GeoIpService } from '@modules/auth/application/geo-ip.service';
import { SecurityEventService } from '@modules/auth/application/security-event.service';
import { SessionStatusService } from '@modules/auth/application/session-status.service';
import { AuthController } from '@modules/auth/presentation/auth.controller';
import { UserSession } from '@modules/auth/domain/user-session.entity';
import { SecurityEvent } from '@modules/auth/domain/security-event.entity';
import { SecurityEventType } from '@modules/auth/domain/security-event-type.entity';
import { SessionStatus } from '@modules/auth/domain/session-status.entity';
import { SystemSetting } from '@modules/auth/domain/system-setting.entity';
import { UserSessionRepository } from '@modules/auth/infrastructure/user-session.repository';
import { SecurityEventRepository } from '@modules/auth/infrastructure/security-event.repository';
import { SecurityEventTypeRepository } from '@modules/auth/infrastructure/security-event-type.repository';
import { SessionStatusRepository } from '@modules/auth/infrastructure/session-status.repository';
import { SystemSettingRepository } from '@modules/auth/infrastructure/system-setting.repository';
import { JwtStrategy } from '@modules/auth/strategies/jwt.strategy';
import { UsersModule } from '@modules/users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserSession,
      SecurityEvent,
      SecurityEventType,
      SessionStatus,
      SystemSetting,
    ]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: (() => {
          const secret = configService.get<string>('JWT_SECRET');
          if (!secret) {
            throw new Error('JWT_SECRET no está configurado');
          }
          return secret;
        })(),
        signOptions: {
          expiresIn: '15m',
        },
      }),
    }),
    UsersModule,
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    AuthSettingsService,
    SessionService,
    SessionStatusService,
    GeoIpService,
    GeolocationService,
    SecurityEventService,
    UserSessionRepository,
    SecurityEventRepository,
    SecurityEventTypeRepository,
    SessionStatusRepository,
    SystemSettingRepository,
    JwtStrategy,
  ],
  exports: [AuthService, SessionService, JwtModule, PassportModule],
})
export class AuthModule {}
