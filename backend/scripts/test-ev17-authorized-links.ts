import 'reflect-metadata';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import request from 'supertest';
import { AppModule } from '@src/app.module';
import { TransformInterceptor } from '@common/interceptors/transform.interceptor';

async function main(): Promise<void> {
  const token = (process.argv[2] || '').trim();
  const materialId = (process.argv[3] || '').trim();
  const classEventId = (process.argv[4] || '').trim();

  if (!token || !materialId || !classEventId) {
    throw new Error(
      'Uso: npx ts-node -r tsconfig-paths/register scripts/test-ev17-authorized-links.ts <token> <materialId> <classEventId>',
    );
  }

  let app: INestApplication | null = null;
  try {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api/v1');
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    app.useGlobalInterceptors(new TransformInterceptor(app.get(Reflector)));
    await app.init();

    const docRes = await request(app.getHttpServer())
      .get(`/api/v1/materials/${encodeURIComponent(materialId)}/authorized-link?mode=view`)
      .set('Authorization', `Bearer ${token}`);

    const videoRes = await request(app.getHttpServer())
      .get(`/api/v1/class-events/${encodeURIComponent(classEventId)}/recording-link?mode=embed`)
      .set('Authorization', `Bearer ${token}`);

    console.log(
      JSON.stringify(
        {
          document: {
            status: docRes.status,
            body: docRes.body,
          },
          video: {
            status: videoRes.status,
            body: videoRes.body,
          },
        },
        null,
        2,
      ),
    );
  } finally {
    if (app) {
      await app.close();
    }
  }
}

void main();
