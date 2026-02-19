import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Response } from 'express';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiResponse } from '@common/interfaces/api-response.interface';
import { RESPONSE_MESSAGE_KEY } from '@common/decorators/response-message.decorator';

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<
  T,
  ApiResponse<T>
> {
  constructor(private reflector: Reflector) {}

  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ApiResponse<T>> {
    return next.handle().pipe(
      map((data) => {
        const response = context.switchToHttp().getResponse<Response>();
        const statusCode = response.statusCode;

        const customMessage = this.reflector.get<string>(
          RESPONSE_MESSAGE_KEY,
          context.getHandler(),
        );

        const message = customMessage || 'Operación exitosa';

        return {
          statusCode,
          message,
          data: (data === undefined ? null : data) as T,
          timestamp: new Date().toISOString(),
        };
      }),
    );
  }
}
