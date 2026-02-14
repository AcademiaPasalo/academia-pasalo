import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { ClassEventRecordingStatus } from '@modules/events/domain/class-event-recording-status.entity';

@Injectable()
export class ClassEventRecordingStatusRepository {
  constructor(
    @InjectRepository(ClassEventRecordingStatus)
    private readonly ormRepository: Repository<ClassEventRecordingStatus>,
  ) {}

  async findByCode(
    code: string,
    manager?: EntityManager,
  ): Promise<ClassEventRecordingStatus | null> {
    const repo = manager
      ? manager.getRepository(ClassEventRecordingStatus)
      : this.ormRepository;

    return await repo.findOne({ where: { code } });
  }
}

