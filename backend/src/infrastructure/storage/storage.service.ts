import {
  Injectable,
  Logger,
  OnModuleInit,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as crypto from 'crypto';

@Injectable()
export class StorageService implements OnModuleInit {
  private readonly logger = new Logger(StorageService.name);
  private readonly storageRoot: string;

  constructor(private readonly configService: ConfigService) {
    this.storageRoot = this.configService.get<string>(
      'STORAGE_PATH',
      path.join(process.cwd(), 'uploads'),
    );
  }

  async onModuleInit() {
    try {
      await fs.mkdir(this.storageRoot, { recursive: true });
      this.logger.log({
        message: 'Directorio de almacenamiento inicializado',
        path: this.storageRoot,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      this.logger.error({
        message: 'Fallo al inicializar el directorio de almacenamiento',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      });
      throw new InternalServerErrorException(
        'Error crítico de infraestructura de almacenamiento.',
      );
    }
  }

  async calculateHash(buffer: Buffer): Promise<string> {
    return crypto.createHash('sha256').update(buffer).digest('hex');
  }

  async saveFile(fileName: string, buffer: Buffer): Promise<string> {
    try {
      const filePath = path.join(this.storageRoot, fileName);
      await fs.writeFile(filePath, buffer);
      return filePath;
    } catch (error) {
      this.logger.error({
        message: 'Error al guardar archivo físicamente',
        fileName,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      });
      throw new InternalServerErrorException(
        'No se pudo persistir el archivo en el servidor.',
      );
    }
  }

  async deleteFile(fileName: string): Promise<void> {
    try {
      const filePath = path.join(this.storageRoot, fileName);
      await fs.unlink(filePath);
    } catch (error) {
      this.logger.warn({
        message: 'Error al intentar eliminar archivo (posiblemente no exista)',
        fileName,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      });
    }
  }

  getStorageRoot(): string {
    return this.storageRoot;
  }
}
