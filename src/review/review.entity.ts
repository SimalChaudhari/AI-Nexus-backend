import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { UserEntity } from '../user/users.entity';
import { CourseEntity } from '../course/courses.entity';
import { SpikerEntity } from '../spikers/spikers.entity';

@Entity('reviews')
@Index(['userId'])
@Index(['courseId'])
@Index(['spikerId'])
export class ReviewEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  userId!: string;

  @Column({ type: 'boolean', default: false })
  isSpiker!: boolean;

  @Column({ type: 'boolean', default: true })
  isCourse!: boolean;

  @Column({ type: 'uuid', nullable: true })
  courseId!: string | null;

  @Column({ type: 'uuid', nullable: true })
  spikerId!: string | null;

  @Column({ type: 'decimal', precision: 3, scale: 2 }) // e.g. 1.00 - 5.00
  rating!: number;

  @Column({ type: 'text', nullable: true })
  feedback?: string | null;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt!: Date;

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user!: UserEntity;

  @ManyToOne(() => CourseEntity, { onDelete: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'courseId' })
  course?: CourseEntity | null;

  @ManyToOne(() => SpikerEntity, { onDelete: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'spikerId' })
  spiker?: SpikerEntity | null;
}
