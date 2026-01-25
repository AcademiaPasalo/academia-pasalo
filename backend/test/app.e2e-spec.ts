import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { HttpAdapterHost, Reflector } from '@nestjs/core';
import { AppController } from './../src/app.controller';
import { AppService } from './../src/app.service';
import { AllExceptionsFilter } from './../src/common/filters/all-exceptions.filter';
import { TransformInterceptor } from './../src/common/interceptors/transform.interceptor';

describe('AppController (e2e)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    app = moduleFixture.createNestApplication();

    app.setGlobalPrefix('api/v1');
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    const httpAdapterHost = app.get(HttpAdapterHost);
    const reflector = app.get(Reflector);
    app.useGlobalFilters(new AllExceptionsFilter(httpAdapterHost));
    app.useGlobalInterceptors(new TransformInterceptor(reflector));

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/api/v1/ (GET)', async () => {
    const response = await request(app.getHttpServer()).get('/api/v1/').expect(200);

    expect(response.body).toMatchObject({
      statusCode: 200,
      message: 'Operación exitosa',
      data: 'Hello World!',
    });
    expect(typeof response.body.timestamp).toBe('string');
  });
});
