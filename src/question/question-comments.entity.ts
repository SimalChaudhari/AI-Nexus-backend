import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { QuestionEntity } from './questions.entity';
import { UserEntity } from '../user/users.entity';

@Entity('question_comments')
export class QuestionCommentEntity {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ type: 'text' })
    content!: string;

    @ManyToOne(() => QuestionEntity, (question) => question.comments, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'questionId' })
    question!: QuestionEntity;

    @Column({ type: 'uuid' })
    questionId!: string;

    @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'userId' })
    user!: UserEntity;

    @Column({ type: 'uuid' })
    userId!: string;

    @ManyToOne(() => QuestionCommentEntity, (comment) => comment.replies, { onDelete: 'CASCADE', nullable: true })
    @JoinColumn({ name: 'parentCommentId' })
    parentComment!: QuestionCommentEntity | null;

    @Column({ type: 'uuid', nullable: true })
    parentCommentId!: string | null;

    @OneToMany(() => QuestionCommentEntity, (comment) => comment.parentComment)
    replies!: QuestionCommentEntity[];

    @CreateDateColumn({ type: 'timestamp' })
    createdAt!: Date;

    @UpdateDateColumn({ type: 'timestamp' })
    updatedAt!: Date;
}
