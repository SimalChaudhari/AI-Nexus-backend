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

    @CreateDateColumn({ type: 'timestamp' })
    createdAt!: Date;

    @UpdateDateColumn({ type: 'timestamp' })
    updatedAt!: Date;
}

