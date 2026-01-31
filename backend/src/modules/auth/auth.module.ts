import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthController } from './presentation/auth.controller';
import { AuthService } from './application/auth.service';
import { SessionService } from './application/session.service';
import { TokenService } from './application/token.service';
import { GoogleProviderService } from './application/google-provider.service';
import { SessionStatusService } from './application/session-status.service';
import { SecurityEventService } from './application/security-event.service';
import { AuthSettingsService } from './application/auth-settings.service';
import { GeolocationService } from './application/geolocation.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { User } from '@modules/users/domain/user.entity';
import { UserSession } from './domain/user-session.entity';
import { SecurityEvent } from './domain/security-event.entity';
import { SecurityEventType } from './domain/security-event-type.entity';
import { SessionStatus } from './domain/session-status.entity';
import { UserSessionRepository } from './infrastructure/user-session.repository';
import { SecurityEventRepository } from './infrastructure/security-event.repository';
import { SecurityEventTypeRepository } from './infrastructure/security-event-type.repository';
import { SessionStatusRepository } from './infrastructure/session-status.repository';
import { UsersModule } from '@modules/users/users.module';
import { GeoModule } from '@infrastructure/geo/geo.module';
import { SettingsModule } from '@modules/settings/settings.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      UserSession,
      SecurityEvent,
      SecurityEventType,
      SessionStatus,
    ]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '15m' },
      }),
    }),
    UsersModule,
    GeoModule,
    SettingsModule,
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    SessionService,
    TokenService,
    GoogleProviderService,
    SessionStatusService,
    SecurityEventService,
    AuthSettingsService,
    GeolocationService,
    JwtStrategy,
    UserSessionRepository,
    SecurityEventRepository,
    SecurityEventTypeRepository,
    SessionStatusRepository,
  ],
  exports: [AuthService, SessionService, AuthSettingsService, SessionStatusRepository],
})
export class AuthModule {}
