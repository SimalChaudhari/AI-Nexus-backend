import { Injectable, NotFoundException } from '@nestjs/common';
import { AnnouncementEntity } from './announcements.entity';
import { CommentEntity } from './comments.entity';
import { PinnedAnnouncementEntity } from './pinned-announcements.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateAnnouncementDto, UpdateAnnouncementDto, CreateCommentDto, UpdateCommentDto } from './announcements.dto';
import { UserEntity } from '../user/users.entity';

@Injectable()
export class AnnouncementService {
    constructor(
        @InjectRepository(AnnouncementEntity)
        private announcementRepository: Repository<AnnouncementEntity>,
        @InjectRepository(CommentEntity)
        private commentRepository: Repository<CommentEntity>,
        @InjectRepository(PinnedAnnouncementEntity)
        private pinnedAnnouncementRepository: Repository<PinnedAnnouncementEntity>,
        @InjectRepository(UserEntity)
        private userRepository: Repository<UserEntity>,
    ) {}

    async getAll(userId?: string): Promise<AnnouncementEntity[]> {
        const announcements = await this.announcementRepository.find({
            relations: ['comments', 'comments.user'],
            order: { createdAt: 'DESC' },
        });

        // If user is logged in, add pinned status
        if (userId) {
            const pinnedAnnouncements = await this.pinnedAnnouncementRepository.find({
                where: { userId },
                select: ['announcementId'],
            });
            const pinnedIds = new Set(pinnedAnnouncements.map((pa) => pa.announcementId));
            console.log(`📌 User ${userId.substring(0, 8)}... has ${pinnedIds.size} pinned announcements`);
            
            // Add isPinned property to each announcement
            const announcementsWithPinned = announcements.map((announcement) => ({
                ...announcement,
                isPinned: pinnedIds.has(announcement.id),
            })) as AnnouncementEntity[];
            
            return announcementsWithPinned;
        }

        return announcements;
    }

    async getById(id: string, userId?: string): Promise<AnnouncementEntity> {
        const announcement = await this.announcementRepository.findOne({
            where: { id },
            relations: ['comments', 'comments.user'],
        });
        if (!announcement) {
            throw new NotFoundException('Announcement not found');
        }

        // If user is logged in, add pinned status
        if (userId) {
            const pinnedAnnouncement = await this.pinnedAnnouncementRepository.findOne({
                where: { userId, announcementId: id },
            });
            return {
                ...announcement,
                isPinned: !!pinnedAnnouncement,
            } as AnnouncementEntity;
        }

        return announcement;
    }

    async incrementViewCount(id: string): Promise<AnnouncementEntity> {
        const announcement = await this.announcementRepository.findOne({
            where: { id },
            relations: ['comments', 'comments.user'],
        });
        if (!announcement) {
            throw new NotFoundException('Announcement not found');
        }
        
        announcement.viewCount += 1;
        await this.announcementRepository.save(announcement);
        return announcement;
    }

    async create(createAnnouncementDto: CreateAnnouncementDto): Promise<{ message: string; announcement: AnnouncementEntity }> {
        const announcementData: Partial<AnnouncementEntity> = {
            title: createAnnouncementDto.title,
            description: createAnnouncementDto.description,
            viewCount: 0,
        };

        const announcement = this.announcementRepository.create(announcementData);
        await this.announcementRepository.save(announcement);
        
        return {
            message: 'Announcement created successfully',
            announcement: announcement,
        };
    }

    async update(id: string, updateAnnouncementDto: UpdateAnnouncementDto): Promise<{ message: string; announcement: AnnouncementEntity }> {
        const announcement = await this.announcementRepository.findOne({ where: { id } });
        if (!announcement) {
            throw new NotFoundException('Announcement not found');
        }

        if (updateAnnouncementDto.title !== undefined) {
            announcement.title = updateAnnouncementDto.title;
        }
        if (updateAnnouncementDto.description !== undefined) {
            announcement.description = updateAnnouncementDto.description;
        }

        await this.announcementRepository.save(announcement);
        return {
            message: 'Announcement updated successfully',
            announcement: announcement,
        };
    }

    async delete(id: string): Promise<{ message: string }> {
        const announcement = await this.announcementRepository.findOne({ where: { id } });
        if (!announcement) {
            throw new NotFoundException('Announcement not found');
        }

        await this.announcementRepository.remove(announcement);
        return { message: 'Announcement deleted successfully' };
    }

    async addComment(announcementId: string, userId: string, createCommentDto: CreateCommentDto): Promise<{ message: string; comment: CommentEntity }> {
        const announcement = await this.announcementRepository.findOne({ where: { id: announcementId } });
        if (!announcement) {
            throw new NotFoundException('Announcement not found');
        }

        const user = await this.userRepository.findOne({ where: { id: userId } });
        if (!user) {
            throw new NotFoundException('User not found');
        }

        const commentData: Partial<CommentEntity> = {
            content: createCommentDto.content,
            announcementId: announcementId,
            userId: userId,
        };

        const comment = this.commentRepository.create(commentData);
        await this.commentRepository.save(comment);

        // Load the comment with relations for response
        const commentWithRelations = await this.commentRepository.findOne({
            where: { id: comment.id },
            relations: ['user', 'announcement'],
        });

        return {
            message: 'Comment added successfully',
            comment: commentWithRelations!,
        };
    }

    async getComments(announcementId: string): Promise<CommentEntity[]> {
        const announcement = await this.announcementRepository.findOne({ where: { id: announcementId } });
        if (!announcement) {
            throw new NotFoundException('Announcement not found');
        }

        return await this.commentRepository.find({
            where: { announcementId },
            relations: ['user'],
            order: { createdAt: 'DESC' },
        });
    }

    async updateComment(commentId: string, userId: string, updateCommentDto: UpdateCommentDto): Promise<{ message: string; comment: CommentEntity }> {
        const comment = await this.commentRepository.findOne({
            where: { id: commentId },
            relations: ['user'],
        });
        if (!comment) {
            throw new NotFoundException('Comment not found');
        }

        // Check if user owns the comment
        if (comment.userId !== userId) {
            throw new NotFoundException('You can only update your own comments');
        }

        comment.content = updateCommentDto.content;
        await this.commentRepository.save(comment);

        // Load with relations
        const updatedComment = await this.commentRepository.findOne({
            where: { id: comment.id },
            relations: ['user', 'announcement'],
        });

        return {
            message: 'Comment updated successfully',
            comment: updatedComment!,
        };
    }

    async deleteComment(commentId: string): Promise<{ message: string }> {
        const comment = await this.commentRepository.findOne({ where: { id: commentId } });
        if (!comment) {
            throw new NotFoundException('Comment not found');
        }

        await this.commentRepository.remove(comment);
        return { message: 'Comment deleted successfully' };
    }

    async pinAnnouncement(announcementId: string, userId: string): Promise<{ message: string; pinned: boolean }> {
        const announcement = await this.announcementRepository.findOne({ where: { id: announcementId } });
        if (!announcement) {
            throw new NotFoundException('Announcement not found');
        }

        const user = await this.userRepository.findOne({ where: { id: userId } });
        if (!user) {
            throw new NotFoundException('User not found');
        }

        // Check if already pinned
        const existingPin = await this.pinnedAnnouncementRepository.findOne({
            where: { userId, announcementId },
        });

        if (existingPin) {
            return { message: 'Announcement is already pinned', pinned: true };
        }

        const pinnedAnnouncement = this.pinnedAnnouncementRepository.create({
            userId,
            announcementId,
        });

        await this.pinnedAnnouncementRepository.save(pinnedAnnouncement);
        return { message: 'Announcement pinned successfully', pinned: true };
    }

    async unpinAnnouncement(announcementId: string, userId: string): Promise<{ message: string; pinned: boolean }> {
        const pinnedAnnouncement = await this.pinnedAnnouncementRepository.findOne({
            where: { userId, announcementId },
        });

        if (!pinnedAnnouncement) {
            throw new NotFoundException('Pinned announcement not found');
        }

        await this.pinnedAnnouncementRepository.remove(pinnedAnnouncement);
        return { message: 'Announcement unpinned successfully', pinned: false };
    }

    async togglePinAnnouncement(announcementId: string, userId: string): Promise<{ message: string; pinned: boolean }> {
        const existingPin = await this.pinnedAnnouncementRepository.findOne({
            where: { userId, announcementId },
        });

        if (existingPin) {
            return await this.unpinAnnouncement(announcementId, userId);
        } else {
            return await this.pinAnnouncement(announcementId, userId);
        }
    }
}
