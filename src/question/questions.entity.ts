import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { QuestionCommentEntity } from './question-comments.entity';

@Entity('questions')
export class QuestionEntity {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ type: 'varchar' })
    title!: string;

    @Column({ type: 'text' })
    description!: string;

    /** Optional: set when a logged-in user creates the question */
    @Column({ type: 'uuid', nullable: true })
    userId!: string | null;

    @Column({ type: 'int', default: 0 })
    viewCount!: number;

    @OneToMany(() => QuestionCommentEntity, (comment) => comment.question, { cascade: true })
    comments!: QuestionCommentEntity[];

    @CreateDateColumn({ type: 'timestamp' })
    createdAt!: Date;

    @UpdateDateColumn({ type: 'timestamp' })
    updatedAt!: Date;
}
