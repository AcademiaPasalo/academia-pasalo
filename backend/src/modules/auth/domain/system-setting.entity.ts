import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('system_setting')
export class SystemSetting {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @Column({ type: 'varchar', length: 100, name: 'setting_key' })
  settingKey: string;

  @Column({ type: 'varchar', length: 255, name: 'setting_value' })
  settingValue: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  description: string | null;

  @Column({ type: 'datetime', name: 'created_at' })
  createdAt: Date;

  @Column({ type: 'datetime', name: 'updated_at', nullable: true })
  updatedAt: Date | null;
}

