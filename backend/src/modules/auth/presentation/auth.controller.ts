import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Req,
  UseGuards,
} from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import express from 'express';
import { AuthService } from '@modules/auth/application/auth.service';
import { GoogleLoginDto } from '@modules/auth/dto/google-login.dto';
import { RefreshTokenDto } from '@modules/auth/dto/refresh-token.dto';
import { ResolveConcurrentSessionDto } from '@modules/auth/dto/resolve-concurrent-session.dto';
import { ReauthAnomalousSessionDto } from '@modules/auth/dto/reauth-anomalous-session.dto';
import { SwitchProfileDto } from '@modules/auth/dto/switch-profile.dto';
import { AuthResponseDto } from '@modules/auth/dto/auth-response.dto';
import { UserResponseDto } from '@modules/users/dto/user-response.dto';
import { ResponseMessage } from '@common/decorators/response-message.decorator';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { CurrentUser } from '@common/decorators/current-user.decorator';
import type { UserWithSession } from '@modules/auth/strategies/jwt.strategy';
import { RequestMetadata } from '@modules/auth/interfaces/request-metadata.interface';
import { technicalSettings } from '@config/technical-settings';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('google')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Inicio de sesión exitoso')
  async loginWithGoogle(
    @Body() googleLoginDto: GoogleLoginDto,
    @Req() request: express.Request,
  ) {
    const metadata = this.extractRequestMetadata(request, googleLoginDto.deviceId);

    const { accessToken, refreshToken, user, sessionStatus, concurrentSessionId } =
      await this.authService.loginWithGoogle(googleLoginDto.code, metadata);

    const userResponse = plainToInstance(UserResponseDto, user, {
      excludeExtraneousValues: true,
    });

    return plainToInstance(
      AuthResponseDto,
      {
        accessToken,
        refreshToken,
        expiresIn: technicalSettings.auth.tokens.authResponseExpiresInSeconds,
        sessionStatus,
        concurrentSessionId,
        user: userResponse,
      },
      { excludeExtraneousValues: true },
    );
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Token renovado exitosamente')
  async refreshToken(@Body() refreshTokenDto: RefreshTokenDto) {
    const { accessToken, refreshToken } =
      await this.authService.refreshAccessToken(
        refreshTokenDto.refreshToken,
        refreshTokenDto.deviceId,
      );

    return plainToInstance(
      AuthResponseDto,
      {
        accessToken,
        refreshToken,
        expiresIn: technicalSettings.auth.tokens.authResponseExpiresInSeconds,
        user: null, 
      },
      { excludeExtraneousValues: true },
    );
  }

  @Post('sessions/resolve-concurrent')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Sesión concurrente resuelta')
  async resolveConcurrentSession(
    @Body() resolveDto: ResolveConcurrentSessionDto,
    @Req() request: express.Request,
  ) {
    const metadata = this.extractRequestMetadata(request, resolveDto.deviceId);

    return await this.authService.resolveConcurrentSession(
      resolveDto.refreshToken,
      resolveDto.deviceId,
      resolveDto.decision,
      metadata,
    );
  }

  @Post('sessions/reauth-anomalous')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Reautenticación exitosa')
  async reauthAnomalousSession(
    @Body() reauthDto: ReauthAnomalousSessionDto,
    @Req() request: express.Request,
  ) {
    const metadata = this.extractRequestMetadata(request, reauthDto.deviceId);

    const { accessToken, refreshToken, expiresIn } =
      await this.authService.reauthAnomalousSession(
      reauthDto.code,
      reauthDto.refreshToken,
      reauthDto.deviceId,
      metadata,
    );

    return plainToInstance(
      AuthResponseDto,
      {
        accessToken,
        refreshToken,
        expiresIn,
        user: null,
      },
      { excludeExtraneousValues: true },
    );
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Sesión cerrada exitosamente')
  async logout(@CurrentUser() user: UserWithSession) {
    if (user.sessionId) {
      await this.authService.logout(user.sessionId, user.id);
    }
  }

  @Post('switch-profile')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Perfil cambiado exitosamente')
  async switchProfile(
    @CurrentUser() user: UserWithSession,
    @Body() switchProfileDto: SwitchProfileDto,
    @Req() request: express.Request,
  ) {
    const metadata = this.extractRequestMetadata(request, switchProfileDto.deviceId);

    const { accessToken, refreshToken } = await this.authService.switchProfile(
      user.id,
      user.sessionId,
      switchProfileDto.roleId,
      metadata,
    );

    return plainToInstance(
      AuthResponseDto,
      {
        accessToken,
        refreshToken,
        expiresIn: technicalSettings.auth.tokens.authResponseExpiresInSeconds,
        user: null,
      },
      { excludeExtraneousValues: true },
    );
  }

  private extractRequestMetadata(request: express.Request, deviceId: string): RequestMetadata {
    const ipAddress =
      (request.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
      request.socket.remoteAddress ||
      '0.0.0.0';

    const userAgent = request.headers['user-agent'] || 'Unknown';

    return {
      ipAddress,
      userAgent,
      deviceId,
    };
  }
}
