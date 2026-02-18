import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('tutorials')
export class TutorialEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  /** URL-friendly identifier, e.g. "tutorial-1" for /tutorials/tutorial-1 */
  @Column({ type: 'varchar', unique: true })
  slug!: string;

  @Column({ type: 'varchar' })
  title!: string;

  @Column({ type: 'text' })
  description!: string;

  @Column({ type: 'varchar', nullable: true })
  thumbnail!: string | null;

  @Column({ type: 'varchar', nullable: true })
  videoUrl!: string | null;

  @Column({ type: 'varchar', nullable: true })
  embedUrl!: string | null;

  @Column({ type: 'varchar', nullable: true })
  category!: string | null;

  @Column({ type: 'varchar', nullable: true })
  source!: string | null;

  @Column({ type: 'varchar', nullable: true })
  language!: string | null;

  @Column({ type: 'varchar', nullable: true })
  duration!: string | null;

  @Column({ type: 'int', default: 0 })
  viewCount!: number;

  @Column({ type: 'varchar', nullable: true })
  authorName!: string | null;

  @Column({ type: 'varchar', nullable: true })
  authorAvatarUrl!: string | null;

  @Column({ type: 'varchar', nullable: true })
  authorRole!: string | null;

  @Column({ type: 'int', default: 0 })
  likes!: number;

  @Column({ type: 'int', default: 0 })
  commentCount!: number;

  @Column({ type: 'timestamp', nullable: true })
  publishedAt!: Date | null;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt!: Date;
}
