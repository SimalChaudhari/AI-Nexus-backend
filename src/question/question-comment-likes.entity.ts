import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, Unique } from 'typeorm';
import { QuestionCommentEntity } from './question-comments.entity';
import { UserEntity } from '../user/users.entity';

@Entity('question_comment_likes')
@Unique(['userId', 'commentId'])
export class QuestionCommentLikeEntity {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @ManyToOne(() => QuestionCommentEntity, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'commentId' })
    comment!: QuestionCommentEntity;

    @Column({ type: 'uuid' })
    commentId!: string;

    @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'userId' })
    user!: UserEntity;

    @Column({ type: 'uuid' })
    userId!: string;
}
