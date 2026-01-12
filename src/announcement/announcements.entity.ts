import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { CommentEntity } from './comments.entity';

@Entity('announcements')
export class AnnouncementEntity {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ type: 'varchar' })
    title!: string;

    @Column({ type: 'text' })
    description!: string;

    @Column({ type: 'int', default: 0 })
    viewCount!: number;

    @OneToMany(() => CommentEntity, (comment) => comment.announcement, { cascade: true })
    comments!: CommentEntity[];

    @CreateDateColumn({ type: 'timestamp' })
    createdAt!: Date;

    @UpdateDateColumn({ type: 'timestamp' })
    updatedAt!: Date;
}
