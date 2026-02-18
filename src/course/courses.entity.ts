import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum CourseLevel {
    Beginner = 'Beginner',
    Intermediate = 'Intermediate',
    Advanced = 'Advanced',
}

@Entity('courses')
export class CourseEntity {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ type: 'varchar' })
    title!: string;

    @Column({ type: 'text', nullable: true })
    description?: string;

    @Column({ type: 'text', nullable: true })
    image?: string; // Store file path

    @Column({ type: 'varchar', length: 500, nullable: true })
    video?: string; // YouTube or other video link

    @Column({ type: 'boolean', default: false })
    freeOrPaid!: boolean; // false = free, true = paid

    @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true, default: 0 })
    amount?: number; // Price amount if paid

    @Column({
        type: 'enum',
        enum: CourseLevel,
        default: CourseLevel.Beginner,
    })
    level!: CourseLevel;

    /** Language IDs this course is available in (array of UUIDs) */
    @Column({ type: 'jsonb', nullable: true })
    languageIds?: string[];

    /** Spiker IDs (instructors/speakers) for this course */
    @Column({ type: 'jsonb', nullable: true })
    spikerIds?: string[];

    /** Optional market data (plain string, stored as JSON string in jsonb column) */
    @Column({
      type: 'jsonb',
      nullable: true,
      transformer: {
        to: (value: string | null | undefined) =>
          value == null || value === '' ? null : JSON.stringify(value),
        from: (value: string | null | undefined) =>
          value == null ? undefined : (typeof value === 'string' ? value : JSON.stringify(value)),
      },
    })
    marketData?: string;

    /** Review count or rating (e.g. number of reviews) */
    @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true, default: 0 })
    review?: number;

    @CreateDateColumn({ type: 'timestamp' })
    createdAt!: Date;

    @UpdateDateColumn({ type: 'timestamp' })
    updatedAt!: Date;
}

