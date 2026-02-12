import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToMany,
  JoinTable,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Role } from './role.entity';

export enum PhotoSource {
  GOOGLE = 'google',
  UPLOADED = 'uploaded',
  NONE = 'none',
}

@Entity('user')
export class User {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: string;

  @Column({ type: 'varchar', length: 255, nullable: false, unique: true })
  email: string;

  @Column({ type: 'varchar', length: 50, nullable: false, name: 'first_name' })
  firstName: string;

  @Column({ type: 'varchar', length: 50, nullable: true, name: 'last_name_1' })
  lastName1: string | null;

  @Column({ type: 'varchar', length: 50, nullable: true, name: 'last_name_2' })
  lastName2: string | null;

  @Column({ type: 'varchar', length: 20, nullable: true })
  phone: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  career: string | null;

  @Column({
    type: 'varchar',
    length: 500,
    nullable: true,
    name: 'profile_photo_url',
  })
  profilePhotoUrl: string | null;

  @Column({
    type: 'enum',
    enum: PhotoSource,
    default: PhotoSource.NONE,
    nullable: false,
    name: 'photo_source',
  })
  photoSource: PhotoSource;

  @Column({ type: 'bigint', name: 'last_active_role_id', nullable: true })
  lastActiveRoleId: string | null;

  @ManyToOne(() => Role)
  @JoinColumn({ name: 'last_active_role_id' })
  lastActiveRole: Role | null;

  @Column({ type: 'boolean', name: 'is_active', default: true })
  isActive: boolean;

  @Column({ type: 'datetime', nullable: false, name: 'created_at' })
  createdAt: Date;

  @Column({ type: 'datetime', nullable: true, name: 'updated_at' })
  updatedAt: Date | null;

  @ManyToMany(() => Role)
  @JoinTable({
    name: 'user_role',
    joinColumn: { name: 'user_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'role_id', referencedColumnName: 'id' },
  })
  roles: Role[];
}
