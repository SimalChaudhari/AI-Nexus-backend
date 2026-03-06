import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { UserEntity } from '../user/users.entity';

@Entity('course_progress')
@Unique(['userId', 'courseId'])
export class CourseProgressEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user!: UserEntity;

  @Column({ type: 'uuid' })
  userId!: string;

  @Column({ type: 'uuid' })
  courseId!: string;

  /** Section (lesson) id the user is currently on */
  @Column({ type: 'uuid' })
  currentSectionId!: string;

  /** Section ids the user has viewed (for progress fill) */
  @Column({ type: 'jsonb', default: [] })
  viewedSectionIds!: string[];

  @Column({ type: 'timestamp' })
  lastAccessedAt!: Date;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt!: Date;
}
