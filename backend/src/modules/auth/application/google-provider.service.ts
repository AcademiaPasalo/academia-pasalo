import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OAuth2Client } from 'google-auth-library';

@Injectable()
export class GoogleProviderService {
  private readonly logger = new Logger(GoogleProviderService.name);
  private readonly googleClient: OAuth2Client;

  constructor(private readonly configService: ConfigService) {
    const googleClientId = this.configService.get<string>('GOOGLE_CLIENT_ID');
    const googleClientSecret = this.configService.get<string>('GOOGLE_CLIENT_SECRET');
    const googleRedirectUri = this.configService.get<string>('GOOGLE_REDIRECT_URI');

    if (!googleClientId || !googleClientSecret) {
      throw new Error('Configuración de Google OAuth incompleta');
    }

    this.googleClient = new OAuth2Client(
      googleClientId,
      googleClientSecret,
      googleRedirectUri || 'postmessage',
    );
  }

  async verifyCodeAndGetEmail(code: string): Promise<string> {
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
        context: GoogleProviderService.name,
        message: 'Error al intercambiar código de Google por tokens',
        error: error instanceof Error ? error.message : String(error),
      });
      throw new UnauthorizedException('Error de autenticación con Google');
    }
  }
}
