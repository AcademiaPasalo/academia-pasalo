import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';
import type { EntityManager } from 'typeorm';
import { UsersService } from '@modules/users/application/users.service';
import { SessionService } from '@modules/auth/application/session.service';
import { SecurityEventService } from '@modules/auth/application/security-event.service';
import {
  SessionStatusCode,
  SessionStatusService,
} from '@modules/auth/application/session-status.service';
import { AuthSettingsService } from '@modules/auth/application/auth-settings.service';
import { GoogleProviderService } from '@modules/auth/application/google-provider.service';
import { TokenService } from '@modules/auth/application/token.service';
import { User } from '@modules/users/domain/user.entity';
import { JwtPayload } from '@modules/auth/interfaces/jwt-payload.interface';
import { RequestMetadata } from '@modules/auth/interfaces/request-metadata.interface';
import { RedisCacheService } from '@infrastructure/cache/redis-cache.service';
import { createHash } from 'crypto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly dataSource: DataSource,
    private readonly usersService: UsersService,
    private readonly sessionService: SessionService,
    private readonly securityEventService: SecurityEventService,
    private readonly sessionStatusService: SessionStatusService,
    private readonly authSettingsService: AuthSettingsService,
    private readonly cacheService: RedisCacheService,
    private readonly googleProviderService: GoogleProviderService,
    private readonly tokenService: TokenService,
  ) {}

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
    const googleEmail = await this.googleProviderService.verifyCodeAndGetEmail(authCode);

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
          message: 'Inicio de sesión condicional',
          sessionStatus,
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
    const payload = this.tokenService.verifyRefreshToken(refreshToken);

    if (payload.deviceId !== deviceId) {
      throw new UnauthorizedException('Dispositivo no autorizado');
    }

    const session = await this.sessionService.validateRefreshTokenSession(
      payload.sub,
      deviceId,
      refreshToken,
    );

    const user = await this.usersService.findOne(payload.sub);

    await this.cacheService.del(`cache:session:${session.id}:user`);

    // Invalidar el token antiguo (Blacklist)
    const oldTokenHash = createHash('sha256').update(refreshToken).digest('hex');
    const ttlSeconds = 7 * 24 * 60 * 60; // 7 días
    await this.cacheService.set(
      `blacklist:refresh:${oldTokenHash}`,
      { revokedAt: new Date().toISOString(), reason: 'TOKEN_ROTATED' },
      ttlSeconds
    );

    const { token: newRefreshToken, expiresAt: newExpiresAt } = 
      await this.tokenService.generateRefreshToken(user.id, deviceId);

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

    const newAccessToken = await this.tokenService.generateAccessToken(accessPayload);

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  }

  async logout(sessionId: string, userId: string): Promise<void> {
    await this.sessionService.deactivateSession(sessionId);
    await this.cacheService.del(`cache:session:${sessionId}:user`);
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
    const payload = this.tokenService.verifyRefreshToken(refreshToken);
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

    await this.cacheService.del(`cache:session:${keptSessionId}:user`);

    const user = await this.usersService.findOne(payload.sub);
    const accessPayload: JwtPayload = {
      sub: user.id,
      email: user.email,
      roles: user.roles.map((role) => role.code),
      sessionId: keptSessionId,
    };

    const accessToken = await this.tokenService.generateAccessToken(accessPayload);
    const accessTokenTtlMinutes = await this.authSettingsService.getAccessTokenTtlMinutes();

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
    const payload = this.tokenService.verifyRefreshToken(refreshToken);
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
      googleUserEmail = await this.googleProviderService.verifyCodeAndGetEmail(authCode);
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
        await this.cacheService.del(`cache:session:${lockedSession.id}:user`);

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

      await this.cacheService.del(`cache:session:${lockedSession.id}:user`);

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

      const { token: newRefreshToken, expiresAt: newExpiresAt } = 
        await this.tokenService.generateRefreshToken(payload.sub, deviceId);

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

      const accessToken = await this.tokenService.generateAccessToken(accessPayload);
      const accessTokenTtlMinutes = await this.authSettingsService.getAccessTokenTtlMinutes();

      return {
        accessToken,
        refreshToken: newRefreshToken,
        expiresIn: accessTokenTtlMinutes * 60,
      };
    });
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
    const { token: refreshToken, expiresAt } = 
      await this.tokenService.generateRefreshToken(user.id, metadata.deviceId);

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

    const accessToken = await this.tokenService.generateAccessToken(accessTokenPayload);

    return { accessToken, refreshToken, sessionStatus, concurrentSessionId };
  }
}