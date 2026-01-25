import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { DataSource } from 'typeorm';
import type { EntityManager } from 'typeorm';
import { OAuth2Client } from 'google-auth-library';
import { UsersService } from '@modules/users/application/users.service';
import { SessionService } from '@modules/auth/application/session.service';
import { SecurityEventService } from '@modules/auth/application/security-event.service';
import {
  SessionStatusCode,
  SessionStatusService,
} from '@modules/auth/application/session-status.service';
import { AuthSettingsService } from '@modules/auth/application/auth-settings.service';
import { User } from '@modules/users/domain/user.entity';
import { JwtPayload } from '@modules/auth/interfaces/jwt-payload.interface';
import { RequestMetadata } from '@modules/auth/interfaces/request-metadata.interface';

type RefreshTokenPayload = {
  sub: string;
  deviceId: string;
  type: 'refresh';
  iat?: number;
  exp?: number;
};

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private readonly googleClient: OAuth2Client;

  constructor(
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    private readonly dataSource: DataSource,
    private readonly usersService: UsersService,
    private readonly sessionService: SessionService,
    private readonly securityEventService: SecurityEventService,
    private readonly sessionStatusService: SessionStatusService,
    private readonly authSettingsService: AuthSettingsService,
  ) {
    const googleClientId = this.configService.get<string>('GOOGLE_CLIENT_ID');
    const googleClientSecret = this.configService.get<string>('GOOGLE_CLIENT_SECRET');
    const googleRedirectUri = this.configService.get<string>('GOOGLE_REDIRECT_URI');

    if (!googleClientId || !googleClientSecret) {
      throw new Error('Configuración de Google OAuth incompleta (Client ID o Secret)');
    }

    this.googleClient = new OAuth2Client(
      googleClientId,
      googleClientSecret,
      googleRedirectUri || 'postmessage',
    );
  }

  async loginWithGoogle(
    authCode: string,
    metadata: RequestMetadata,
  ): Promise<{
    accessToken: string;
    refreshToken: string;
    user: User;
    sessionStatus: SessionStatusCode;
    concurrentSessionId: string | null;
  }> {
    const googleEmail = await this.verifyCodeAndGetEmail(authCode);

    const user = await this.usersService.findByEmail(googleEmail);

    if (!user) {
      this.logger.warn({
        level: 'warn',
        context: AuthService.name,
        message: 'Intento de inicio de sesión con correo no registrado',
        email: googleEmail,
        ip: metadata.ipAddress,
      });
      throw new UnauthorizedException('El correo no se encuentra registrado en el sistema. Contacte a administración.');
    }

    return await this.dataSource.transaction(async (manager) => {
      const { accessToken, refreshToken, sessionStatus, concurrentSessionId } =
        await this.generateTokens(
        user,
        metadata,
        manager,
      );

      if (sessionStatus !== 'ACTIVE') {
        this.logger.warn({
          level: 'warn',
          context: AuthService.name,
          message: `Inicio de sesión condicional - Estado: ${sessionStatus}`,
          userId: user.id,
          email: user.email,
        });
      }

      return {
        accessToken,
        refreshToken,
        user,
        sessionStatus,
        concurrentSessionId,
      };
    });
  }

  async refreshAccessToken(
    refreshToken: string,
    deviceId: string,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const payload = this.verifyRefreshToken(refreshToken);

    if (payload.deviceId !== deviceId) {
      throw new UnauthorizedException('Dispositivo no autorizado');
    }

    const session = await this.sessionService.validateRefreshTokenSession(
      payload.sub,
      deviceId,
      refreshToken,
    );

    const user = await this.usersService.findOne(payload.sub);

    const refreshTtlDays = await this.authSettingsService.getRefreshTokenTtlDays();
    const newRefreshToken = this.jwtService.sign(
      {
        sub: user.id,
        deviceId,
        type: 'refresh',
      },
      {
        expiresIn: `${refreshTtlDays}d`,
      },
    );

    const newExpiresAt = new Date(
      Date.now() + refreshTtlDays * 24 * 60 * 60 * 1000,
    );

    await this.sessionService.rotateRefreshToken(
      session.id,
      newRefreshToken,
      newExpiresAt,
    );

    const accessPayload: JwtPayload = {
      sub: user.id,
      email: user.email,
      roles: user.roles.map((role) => role.code),
      sessionId: session.id,
    };

    const accessTokenTtlMinutes = await this.authSettingsService.getAccessTokenTtlMinutes();
    const newAccessToken = this.jwtService.sign(accessPayload, {
      expiresIn: `${accessTokenTtlMinutes}m`,
    });

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  }

  async logout(sessionId: string, userId: string): Promise<void> {
    await this.sessionService.deactivateSession(sessionId);
  }

  async resolveConcurrentSession(
    refreshToken: string,
    deviceId: string,
    decision: 'KEEP_NEW' | 'KEEP_EXISTING',
    metadata: RequestMetadata,
  ): Promise<{
    keptSessionId: string | null;
    accessToken?: string;
    refreshToken?: string;
    expiresIn?: number;
  }> {
    const payload = this.verifyRefreshToken(refreshToken);
    if (payload.deviceId !== deviceId) {
      throw new UnauthorizedException('Dispositivo no autorizado');
    }

    const { keptSessionId } = await this.sessionService.resolveConcurrentSession({
      userId: payload.sub,
      deviceId,
      refreshToken,
      decision,
      ipAddress: metadata.ipAddress,
      userAgent: metadata.userAgent,
    });

    if (!keptSessionId) {
      return { keptSessionId: null };
    }

    const user = await this.usersService.findOne(payload.sub);
    const accessPayload: JwtPayload = {
      sub: user.id,
      email: user.email,
      roles: user.roles.map((role) => role.code),
      sessionId: keptSessionId,
    };

    const accessTokenTtlMinutes = await this.authSettingsService.getAccessTokenTtlMinutes();
    const accessToken = this.jwtService.sign(accessPayload, {
      expiresIn: `${accessTokenTtlMinutes}m`,
    });

    return {
      keptSessionId,
      accessToken,
      refreshToken,
      expiresIn: accessTokenTtlMinutes * 60,
    };
  }

  async reauthAnomalousSession(
    authCode: string,
    refreshToken: string,
    deviceId: string,
    metadata: RequestMetadata,
  ): Promise<{ accessToken: string; refreshToken: string; expiresIn: number }> {
    const payload = this.verifyRefreshToken(refreshToken);
    if (payload.deviceId !== deviceId) {
      throw new UnauthorizedException('Dispositivo no autorizado');
    }

    const session = await this.sessionService.findSessionByRefreshToken(refreshToken);
    if (!session || session.userId !== payload.sub || session.deviceId !== deviceId) {
      throw new UnauthorizedException('Sesión inválida o expirada');
    }

    const blockedStatusId =
      await this.sessionStatusService.getIdByCode('BLOCKED_PENDING_REAUTH');
    if (session.sessionStatusId !== blockedStatusId) {
      throw new UnauthorizedException('Sesión inválida o expirada');
    }

    let googleUserEmail: string | undefined;
    let userByEmail: User | null;

    try {
      googleUserEmail = await this.verifyCodeAndGetEmail(authCode);
      userByEmail = await this.usersService.findByEmail(googleUserEmail);
      if (!userByEmail || userByEmail.id !== payload.sub) {
        throw new UnauthorizedException('Token de Google inválido o expirado');
      }
    } catch (error) {
      await this.dataSource.transaction(async (manager) => {
        const lockedSession = await this.sessionService.findSessionByRefreshTokenForUpdate(
          refreshToken,
          manager,
        );

        if (!lockedSession) {
          return;
        }

        if (lockedSession.userId !== payload.sub || lockedSession.deviceId !== deviceId) {
          return;
        }

        const blockedStatusIdInTx = await this.sessionStatusService.getIdByCode(
          'BLOCKED_PENDING_REAUTH',
          manager,
        );

        if (lockedSession.sessionStatusId !== blockedStatusIdInTx) {
          return;
        }

        await this.sessionService.deactivateSession(lockedSession.id, manager);

        await this.securityEventService.logEvent(
          payload.sub,
          'ANOMALOUS_LOGIN_REAUTH_FAILED',
          {
            ipAddress: metadata.ipAddress,
            userAgent: metadata.userAgent,
            deviceId,
            sessionId: lockedSession.id,
            googleEmail: typeof googleUserEmail === 'string' ? googleUserEmail : null,
          },
          manager,
        );
      });

      throw error instanceof UnauthorizedException
        ? error
        : new UnauthorizedException('Token de Google inválido o expirado');
    }

    return await this.dataSource.transaction(async (manager) => {
      const lockedSession = await this.sessionService.findSessionByRefreshTokenForUpdate(
        refreshToken,
        manager,
      );

      if (
        !lockedSession ||
        lockedSession.userId !== payload.sub ||
        lockedSession.deviceId !== deviceId
      ) {
        throw new UnauthorizedException('Sesión inválida o expirada');
      }

      const blockedStatusIdInTx = await this.sessionStatusService.getIdByCode(
        'BLOCKED_PENDING_REAUTH',
        manager,
      );
      if (lockedSession.sessionStatusId !== blockedStatusIdInTx) {
        throw new UnauthorizedException('Sesión inválida o expirada');
      }

      await this.sessionService.activateBlockedSession(lockedSession.id, manager);

      await this.securityEventService.logEvent(
        payload.sub,
        'ANOMALOUS_LOGIN_REAUTH_SUCCESS',
        {
          ipAddress: metadata.ipAddress,
          userAgent: metadata.userAgent,
          deviceId,
          sessionId: lockedSession.id,
        },
        manager,
      );

      const refreshTtlDays = await this.authSettingsService.getRefreshTokenTtlDays();
      const newRefreshToken = this.jwtService.sign(
        {
          sub: payload.sub,
          deviceId,
          type: 'refresh',
        },
        {
          expiresIn: `${refreshTtlDays}d`,
        },
      );

      const newExpiresAt = new Date(
        Date.now() + refreshTtlDays * 24 * 60 * 60 * 1000,
      );

      await this.sessionService.rotateRefreshToken(
        lockedSession.id,
        newRefreshToken,
        newExpiresAt,
        manager,
      );

      const accessPayload: JwtPayload = {
        sub: userByEmail.id,
        email: userByEmail.email,
        roles: userByEmail.roles.map((role) => role.code),
        sessionId: lockedSession.id,
      };

      const accessTokenTtlMinutes = await this.authSettingsService.getAccessTokenTtlMinutes();
      const accessToken = this.jwtService.sign(accessPayload, {
        expiresIn: `${accessTokenTtlMinutes}m`,
      });

      return {
        accessToken,
        refreshToken: newRefreshToken,
        expiresIn: accessTokenTtlMinutes * 60,
      };
    });
  }

  private async verifyCodeAndGetEmail(code: string): Promise<string> {
    try {
      const { tokens } = await this.googleClient.getToken(code);
      this.googleClient.setCredentials(tokens);

      const ticket = await this.googleClient.verifyIdToken({
        idToken: tokens.id_token!,
        audience: this.configService.get<string>('GOOGLE_CLIENT_ID'),
      });

      const payload = ticket.getPayload();

      if (!payload || !payload.email) {
        throw new UnauthorizedException('El token de Google no contiene un correo válido');
      }

      return payload.email;
    } catch (error) {
      this.logger.error({
        level: 'error',
        context: AuthService.name,
        message: 'Error al intercambiar código de Google por tokens',
        error: error instanceof Error ? error.message : String(error),
      });
      throw new UnauthorizedException('Error de autenticación con Google');
    }
  }

  private async generateTokens(
    user: User,
    metadata: RequestMetadata,
    manager?: EntityManager,
  ): Promise<{
    accessToken: string;
    refreshToken: string;
    sessionStatus: SessionStatusCode;
    concurrentSessionId: string | null;
  }> {
    const refreshTtlDays = await this.authSettingsService.getRefreshTokenTtlDays();
    const refreshPayload: RefreshTokenPayload = {
      sub: user.id,
      deviceId: metadata.deviceId,
      type: 'refresh',
    };

    const refreshToken = this.jwtService.sign(refreshPayload, {
      expiresIn: `${refreshTtlDays}d`,
    });

    const expiresAt = new Date(
      Date.now() + refreshTtlDays * 24 * 60 * 60 * 1000,
    );

    const { session, sessionStatus, concurrentSessionId } =
      await this.sessionService.createSession(
        user.id,
        metadata,
        refreshToken,
        expiresAt,
        manager,
      );

    const accessTokenPayload: JwtPayload = {
      sub: user.id,
      email: user.email,
      roles: user.roles.map((role) => role.code),
      sessionId: session.id,
    };

    const accessTokenTtlMinutes = await this.authSettingsService.getAccessTokenTtlMinutes();
    const accessToken = this.jwtService.sign(accessTokenPayload, {
      expiresIn: `${accessTokenTtlMinutes}m`,
    });

    return { accessToken, refreshToken, sessionStatus, concurrentSessionId };
  }

  private verifyRefreshToken(token: string): RefreshTokenPayload {
    try {
      const payload = this.jwtService.verify<RefreshTokenPayload>(token);

      if (
        !payload ||
        payload.type !== 'refresh' ||
        typeof payload.sub !== 'string' ||
        typeof payload.deviceId !== 'string'
      ) {
        throw new UnauthorizedException('Refresh token inválido');
      }

      return payload;
    } catch (error) {
      this.logger.warn({
        level: 'warn',
        context: AuthService.name,
        message: 'Refresh token inválido o expirado',
        error: error instanceof Error ? error.message : String(error),
      });
      throw new UnauthorizedException('Refresh token inválido o expirado');
    }
  }
}
