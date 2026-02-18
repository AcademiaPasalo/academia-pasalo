import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { NestErrorResponse } from '@common/interfaces/nest-error-response.interface';

interface RequestWithUrl {
  url: string;
}

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const { httpAdapter } = this.httpAdapterHost;
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<RequestWithUrl>();

    const httpStatus: HttpStatus =
      exception instanceof HttpException
        ? (exception.getStatus() as HttpStatus)
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const responseBody = {
      statusCode: httpStatus,
      message: this.getErrorMessage(exception),
      error: this.getErrorName(httpStatus),
      timestamp: new Date().toISOString(),
      path: httpAdapter.getRequestUrl(request),
    };

    if (httpStatus === HttpStatus.INTERNAL_SERVER_ERROR) {
      this.logger.error({
        level: 'error',
        context: AllExceptionsFilter.name,
        message: 'Error crítico en la aplicación',
        path: responseBody.path,
        statusCode: httpStatus,
        errorDetails:
          exception instanceof Error
            ? exception.message
            : JSON.stringify(exception),
        stack: exception instanceof Error ? exception.stack : undefined,
        timestamp: responseBody.timestamp,
      });
    } else {
      this.logger.warn({
        level: 'warn',
        context: AllExceptionsFilter.name,
        message: 'Error HTTP controlado',
        path: responseBody.path,
        statusCode: httpStatus,
        error: responseBody.error,
        errorMessage: responseBody.message,
        timestamp: responseBody.timestamp,
      });
    }

    httpAdapter.reply(ctx.getResponse(), responseBody, httpStatus);
  }

  private getErrorMessage(exception: unknown): string | string[] {
    if (exception instanceof HttpException) {
      const response = exception.getResponse();
      if (
        typeof response === 'object' &&
        response !== null &&
        'message' in response
      ) {
        return (response as NestErrorResponse).message;
      }
      return exception.message;
    }
    return 'Error Interno del Servidor. Por favor contacte con la academia.';
  }

  private getErrorName(status: HttpStatus): string {
    return HttpStatus[status] || 'Error Desconocido';
  }
}
