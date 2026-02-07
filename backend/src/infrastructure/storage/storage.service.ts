import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import { technicalSettings } from '@config/technical-settings';

@Injectable()
export class StorageService implements OnModuleInit {
  private readonly logger = new Logger(StorageService.name);
  private storagePath: string;

  constructor(private configService: ConfigService) {
    this.storagePath = this.configService.get<string>(
      'STORAGE_PATH',
      technicalSettings.uploads.storage.storagePathFallback,
    );
  }

  async onModuleInit() {
    if (!fs.existsSync(this.storagePath)) {
      this.logger.log({
        message: 'Creando directorio de almacenamiento',
        path: this.storagePath,
      });
      await fs.promises.mkdir(this.storagePath, { recursive: true });
    }
  }

  async saveFile(fileName: string, buffer: Buffer): Promise<string> {
    const filePath = path.join(this.storagePath, fileName);
    await fs.promises.writeFile(filePath, buffer);
    return filePath;
  }

  async deleteFile(fileName: string): Promise<void> {
    const filePath = path.join(this.storagePath, fileName);
    if (fs.existsSync(filePath)) {
      await fs.promises.unlink(filePath);
    }
  }

  calculateHash(buffer: Buffer): Promise<string> {
    const hash = crypto.createHash('sha256').update(buffer).digest('hex');
    return Promise.resolve(hash);
  }
}
