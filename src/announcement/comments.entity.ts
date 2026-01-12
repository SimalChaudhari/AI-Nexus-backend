import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { AnnouncementEntity } from './announcements.entity';
import { UserEntity } from '../user/users.entity';

@Entity('comments')
export class CommentEntity {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ type: 'text' })
    content!: string;

    @ManyToOne(() => AnnouncementEntity, (announcement) => announcement.comments, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'announcementId' })
    announcement!: AnnouncementEntity;

    @Column({ type: 'uuid' })
    announcementId!: string;

    @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'userId' })
    user!: UserEntity;

    @Column({ type: 'uuid' })
    userId!: string;

    @CreateDateColumn({ type: 'timestamp' })
    createdAt!: Date;

    @UpdateDateColumn({ type: 'timestamp' })
    updatedAt!: Date;
}
