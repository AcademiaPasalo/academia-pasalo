import { NestFactory, HttpAdapterHost, Reflector } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { technicalSettings } from './config/technical-settings';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  try {
    const app = await NestFactory.create<NestExpressApplication>(AppModule);
    const configService = app.get(ConfigService);
    const httpAdapter = app.get(HttpAdapterHost);
    const reflector = app.get(Reflector);
    app.set('trust proxy', 1);

    const corsOrigins = configService
      .get<string>('CORS_ORIGINS')
      ?.split(',')
      .map((o) => o.trim()) ?? [...technicalSettings.http.defaultCorsOrigins];

    if (corsOrigins.length === 0) {
      throw new Error(
        'CORS_ORIGINS no está configurado en las variables de entorno. Revise el archivo .env',
      );
    }

    app.enableCors({
      origin: corsOrigins,
      methods: [...technicalSettings.http.corsAllowedMethods],
      allowedHeaders: [...technicalSettings.http.corsAllowedHeaders],
      credentials: true,
      optionsSuccessStatus: technicalSettings.http.corsOptionsSuccessStatus,
    });

    const apiPrefix = configService.get<string>('API_PREFIX') || 'api/v1';
    app.setGlobalPrefix(apiPrefix);

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    app.useGlobalFilters(new AllExceptionsFilter(httpAdapter));

    app.useGlobalInterceptors(new TransformInterceptor(reflector));

    const port = process.env.PORT ?? 3000;
    await app.listen(port);
    logger.log({
      message: 'Aplicación iniciada exitosamente',
      port,
      apiPrefix,
    });
  } catch (error) {
    const isError = error instanceof Error;
    logger.error({
      message: 'Error fatal durante el inicio de la aplicación',
      error: isError ? error.message : 'Error desconocido',
      stack: isError ? error.stack : undefined,
    });
    process.exit(1);
  }
}

void bootstrap();
