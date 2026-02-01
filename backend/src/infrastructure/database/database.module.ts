import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get<string>('DB_HOST'),
        port: configService.get<number>('DB_PORT'),
        username: configService.get<string>('DB_USER'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_NAME'),
        entities: [__dirname + '/../../**/*.entity{.ts,.js}'],
        synchronize: false,
        timezone: 'Z',
        retryAttempts: 10,
        retryDelay: 5000,
        extra: {
          connectionLimit: 50,
          waitForConnections: true,
          queueLimit: 0,
          connectTimeout: 10000,
        },
      }),
    }),
  ],
})
export class DatabaseModule {}
