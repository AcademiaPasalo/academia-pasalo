import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('class_event_recording_status')
export class ClassEventRecordingStatus {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: string;

  @Column({ type: 'varchar', length: 50 })
  code: string;

  @Column({ type: 'varchar', length: 100 })
  name: string;
}

