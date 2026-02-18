import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('spikers')
export class SpikerEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar' })
  name!: string;

  @Column({ type: 'varchar', nullable: true })
  profileimage?: string;

  @Column({ type: 'text', nullable: true })
  about?: string;

  @Column({ type: 'int', default: 0 })
  totalstudent!: number;

  @Column({ type: 'decimal', precision: 3, scale: 2, nullable: true })
  review?: number;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt!: Date;
}
