import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn, Unique } from 'typeorm';
import { QuestionEntity } from './questions.entity';
import { UserEntity } from '../user/users.entity';

@Entity('pinned_questions')
@Unique(['userId', 'questionId'])
export class PinnedQuestionEntity {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'userId' })
    user!: UserEntity;

    @Column({ type: 'uuid' })
    userId!: string;

    @ManyToOne(() => QuestionEntity, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'questionId' })
    question!: QuestionEntity;

    @Column({ type: 'uuid' })
    questionId!: string;

    @CreateDateColumn({ type: 'timestamp' })
    pinnedAt!: Date;
}
