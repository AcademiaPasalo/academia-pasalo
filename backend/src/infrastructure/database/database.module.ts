import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { technicalSettings } from '@config/technical-settings';

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
        timezone: technicalSettings.database.typeorm.timezone,
        retryAttempts: technicalSettings.database.typeorm.retryAttempts,
        retryDelay: technicalSettings.database.typeorm.retryDelayMs,
        extra: {
          connectionLimit: technicalSettings.database.typeorm.pool.connectionLimit,
          waitForConnections: technicalSettings.database.typeorm.pool.waitForConnections,
          queueLimit: technicalSettings.database.typeorm.pool.queueLimit,
          connectTimeout: technicalSettings.database.typeorm.pool.connectTimeoutMs,
        },
      }),
    }),
  ],
})
export class DatabaseModule {}
