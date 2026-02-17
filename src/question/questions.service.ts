import { Injectable, NotFoundException } from '@nestjs/common';
import { QuestionEntity } from './questions.entity';
import { QuestionCommentEntity } from './question-comments.entity';
import { QuestionCommentLikeEntity } from './question-comment-likes.entity';
import { PinnedQuestionEntity } from './pinned-questions.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { CreateQuestionDto, UpdateQuestionDto, CreateQuestionCommentDto, UpdateQuestionCommentDto } from './questions.dto';
import { UserEntity, UserRole } from '../user/users.entity';

@Injectable()
export class QuestionService {
    constructor(
        @InjectRepository(QuestionEntity)
        private questionRepository: Repository<QuestionEntity>,
        @InjectRepository(QuestionCommentEntity)
        private commentRepository: Repository<QuestionCommentEntity>,
        @InjectRepository(QuestionCommentLikeEntity)
        private commentLikeRepository: Repository<QuestionCommentLikeEntity>,
        @InjectRepository(PinnedQuestionEntity)
        private pinnedQuestionRepository: Repository<PinnedQuestionEntity>,
        @InjectRepository(UserEntity)
        private userRepository: Repository<UserEntity>,
    ) {}

    async getAll(userId?: string): Promise<any[]> {
        const questions = await this.questionRepository.find({
            relations: ['comments', 'comments.user'],
            order: { createdAt: 'DESC' },
        });

        const questionsWithLikes = await Promise.all(
            questions.map(async (question) => {
                const commentsWithLikes = await this.enrichCommentsWithLikes(question.comments || [], userId);
                return { ...question, comments: commentsWithLikes };
            }),
        );
        if (userId) {
            const pinnedQuestions = await this.pinnedQuestionRepository.find({
                where: { userId },
                select: ['questionId'],
            });
            const pinnedIds = new Set(pinnedQuestions.map((pq) => pq.questionId));
            return questionsWithLikes.map((q) => ({ ...q, isPinned: pinnedIds.has(q.id) }));
        }
        return questionsWithLikes;
    }

    async getById(id: string, userId?: string): Promise<any> {
        const question = await this.questionRepository.findOne({
            where: { id },
            relations: ['comments', 'comments.user'],
        });
        if (!question) {
            throw new NotFoundException('Question not found');
        }

        const commentsWithLikes = await this.enrichCommentsWithLikes(question.comments || [], userId);
        let result: any = { ...question, comments: commentsWithLikes };
        if (userId) {
            const pinnedQuestion = await this.pinnedQuestionRepository.findOne({
                where: { userId, questionId: id },
            });
            result = { ...result, isPinned: !!pinnedQuestion };
        }
        return result;
    }

    private async enrichCommentsWithLikes(
        comments: QuestionCommentEntity[],
        userId?: string,
    ): Promise<any[]> {
        if (!comments.length) return [];
        const commentIds = comments.map((c) => c.id);
        const likeCounts = await this.commentLikeRepository
            .createQueryBuilder('cl')
            .select('cl.commentId', 'commentId')
            .addSelect('COUNT(*)', 'count')
            .where('cl.commentId IN (:...ids)', { ids: commentIds })
            .groupBy('cl.commentId')
            .getRawMany();
        const countMap = new Map<string, number>();
        likeCounts.forEach((row: { commentId: string; count: string }) => {
            countMap.set(row.commentId, parseInt(row.count, 10));
        });
        let userLikedIds = new Set<string>();
        if (userId) {
            const userLikes = await this.commentLikeRepository.find({
                where: { userId, commentId: In(commentIds) },
                select: ['commentId'],
            });
            userLikedIds = new Set(userLikes.map((l) => l.commentId));
        }
        return comments.map((comment) => ({
            ...comment,
            likeCount: countMap.get(comment.id) || 0,
            likedByCurrentUser: userLikedIds.has(comment.id),
        }));
    }

    async incrementViewCount(id: string): Promise<QuestionEntity> {
        const question = await this.questionRepository.findOne({
            where: { id },
            relations: ['comments', 'comments.user'],
        });
        if (!question) {
            throw new NotFoundException('Question not found');
        }

        question.viewCount += 1;
        await this.questionRepository.save(question);
        return question;
    }

    async create(createQuestionDto: CreateQuestionDto): Promise<{ message: string; question: QuestionEntity }> {
        const questionData: Partial<QuestionEntity> = {
            title: createQuestionDto.title,
            description: createQuestionDto.description,
            viewCount: 0,
        };

        const question = this.questionRepository.create(questionData);
        await this.questionRepository.save(question);

        return {
            message: 'Question created successfully',
            question,
        };
    }

    async update(id: string, updateQuestionDto: UpdateQuestionDto): Promise<{ message: string; question: QuestionEntity }> {
        const question = await this.questionRepository.findOne({ where: { id } });
        if (!question) {
            throw new NotFoundException('Question not found');
        }

        if (updateQuestionDto.title !== undefined) {
            question.title = updateQuestionDto.title;
        }
        if (updateQuestionDto.description !== undefined) {
            question.description = updateQuestionDto.description;
        }

        await this.questionRepository.save(question);
        return {
            message: 'Question updated successfully',
            question,
        };
    }

    async delete(id: string): Promise<{ message: string }> {
        const question = await this.questionRepository.findOne({ where: { id } });
        if (!question) {
            throw new NotFoundException('Question not found');
        }

        await this.questionRepository.remove(question);
        return { message: 'Question deleted successfully' };
    }

    async addComment(
        questionId: string,
        userId: string,
        createCommentDto: CreateQuestionCommentDto,
    ): Promise<{ message: string; comment: QuestionCommentEntity }> {
        const question = await this.questionRepository.findOne({ where: { id: questionId } });
        if (!question) {
            throw new NotFoundException('Question not found');
        }

        const user = await this.userRepository.findOne({ where: { id: userId } });
        if (!user) {
            throw new NotFoundException('User not found');
        }

        let parentCommentId: string | null = null;
        if (createCommentDto.parentCommentId) {
            const parentComment = await this.commentRepository.findOne({
                where: { id: createCommentDto.parentCommentId },
            });
            if (!parentComment) {
                throw new NotFoundException('Parent comment not found');
            }
            if (parentComment.questionId !== questionId) {
                throw new NotFoundException('Parent comment does not belong to this question');
            }
            parentCommentId = parentComment.id;
        }

        const commentData: Partial<QuestionCommentEntity> = {
            content: createCommentDto.content,
            questionId,
            userId,
            parentCommentId,
        };

        const comment = this.commentRepository.create(commentData);
        await this.commentRepository.save(comment);

        const commentWithRelations = await this.commentRepository.findOne({
            where: { id: comment.id },
            relations: ['user', 'question'],
        });

        return {
            message: 'Comment added successfully',
            comment: commentWithRelations!,
        };
    }

    async getComments(questionId: string, userId?: string): Promise<any[]> {
        const question = await this.questionRepository.findOne({ where: { id: questionId } });
        if (!question) {
            throw new NotFoundException('Question not found');
        }

        const comments = await this.commentRepository.find({
            where: { questionId },
            relations: ['user'],
            order: { createdAt: 'DESC' },
        });

        const commentIds = comments.map((c) => c.id);
        if (commentIds.length === 0) {
            return [];
        }

        const likeCounts = await this.commentLikeRepository
            .createQueryBuilder('cl')
            .select('cl.commentId', 'commentId')
            .addSelect('COUNT(*)', 'count')
            .where('cl.commentId IN (:...ids)', { ids: commentIds })
            .groupBy('cl.commentId')
            .getRawMany();

        const countMap = new Map<string, number>();
        likeCounts.forEach((row: { commentId: string; count: string }) => {
            countMap.set(row.commentId, parseInt(row.count, 10));
        });

        let userLikedIds = new Set<string>();
        if (userId) {
            const userLikes = await this.commentLikeRepository.find({
                where: { userId, commentId: In(commentIds) },
                select: ['commentId'],
            });
            userLikedIds = new Set(userLikes.map((l) => l.commentId));
        }

        return comments.map((comment) => ({
            ...comment,
            parentCommentId: comment.parentCommentId ?? null,
            likeCount: countMap.get(comment.id) || 0,
            likedByCurrentUser: userLikedIds.has(comment.id),
        }));
    }

    async updateComment(
        commentId: string,
        userId: string,
        updateCommentDto: UpdateQuestionCommentDto,
    ): Promise<{ message: string; comment: QuestionCommentEntity }> {
        const comment = await this.commentRepository.findOne({
            where: { id: commentId },
            relations: ['user'],
        });
        if (!comment) {
            throw new NotFoundException('Comment not found');
        }

        const user = await this.userRepository.findOne({ where: { id: userId }, select: ['id', 'role'] });
        const isAdmin = user?.role === UserRole.Admin;
        const isOwner = comment.userId === userId;
        if (!isOwner && !isAdmin) {
            throw new NotFoundException('You can only update your own comments');
        }

        comment.content = updateCommentDto.content;
        await this.commentRepository.save(comment);

        const updatedComment = await this.commentRepository.findOne({
            where: { id: comment.id },
            relations: ['user', 'question'],
        });

        return {
            message: 'Comment updated successfully',
            comment: updatedComment!,
        };
    }

    async deleteComment(commentId: string, userId: string): Promise<{ message: string }> {
        const comment = await this.commentRepository.findOne({ where: { id: commentId } });
        if (!comment) {
            throw new NotFoundException('Comment not found');
        }

        const user = await this.userRepository.findOne({ where: { id: userId }, select: ['id', 'role'] });
        const isAdmin = user?.role === UserRole.Admin;
        const isOwner = comment.userId === userId;
        if (!isOwner && !isAdmin) {
            throw new NotFoundException('You can only delete your own comments');
        }

        // Collect this comment and all descendant reply IDs
        const idsToDelete = new Set<string>([commentId]);
        let added = 1;
        while (added > 0) {
            added = 0;
            const replies = await this.commentRepository.find({
                where: { parentCommentId: In([...idsToDelete]) },
                select: ['id'],
            });
            for (const r of replies) {
                if (!idsToDelete.has(r.id)) {
                    idsToDelete.add(r.id);
                    added += 1;
                }
            }
        }
        const allIds = [...idsToDelete];

        if (allIds.length > 0) {
            await this.commentLikeRepository.delete({ commentId: In(allIds) });
        }

        let remaining = new Set(allIds);
        while (remaining.size > 0) {
            const asArray = [...remaining];
            const commentsInSet = await this.commentRepository.find({
                where: { id: In(asArray) },
                select: ['id', 'parentCommentId'],
            });
            const parentIdsInSet = new Set(
                commentsInSet.map((c) => c.parentCommentId).filter((id): id is string => id != null && remaining.has(id)),
            );
            const leaves = asArray.filter((id) => !parentIdsInSet.has(id));
            for (const id of leaves) {
                await this.commentRepository.delete(id);
                remaining.delete(id);
            }
        }

        return { message: 'Comment deleted successfully' };
    }

    async likeComment(commentId: string, userId: string): Promise<{ message: string; liked: boolean }> {
        const comment = await this.commentRepository.findOne({ where: { id: commentId } });
        if (!comment) {
            throw new NotFoundException('Comment not found');
        }

        const user = await this.userRepository.findOne({ where: { id: userId } });
        if (!user) {
            throw new NotFoundException('User not found');
        }

        const existingLike = await this.commentLikeRepository.findOne({
            where: { userId, commentId },
        });

        if (existingLike) {
            return { message: 'Comment already liked', liked: true };
        }

        const like = this.commentLikeRepository.create({ userId, commentId });
        await this.commentLikeRepository.save(like);
        return { message: 'Comment liked successfully', liked: true };
    }

    async unlikeComment(commentId: string, userId: string): Promise<{ message: string; liked: boolean }> {
        const existingLike = await this.commentLikeRepository.findOne({
            where: { userId, commentId },
        });

        if (!existingLike) {
            return { message: 'Comment not liked', liked: false };
        }

        await this.commentLikeRepository.remove(existingLike);
        return { message: 'Comment unliked successfully', liked: false };
    }

    async toggleCommentLike(commentId: string, userId: string): Promise<{ message: string; liked: boolean }> {
        const existingLike = await this.commentLikeRepository.findOne({
            where: { userId, commentId },
        });

        if (existingLike) {
            await this.commentLikeRepository.remove(existingLike);
            return { message: 'Comment unliked successfully', liked: false };
        }
        return await this.likeComment(commentId, userId);
    }

    async pinQuestion(questionId: string, userId: string): Promise<{ message: string; pinned: boolean }> {
        const question = await this.questionRepository.findOne({ where: { id: questionId } });
        if (!question) {
            throw new NotFoundException('Question not found');
        }

        const user = await this.userRepository.findOne({ where: { id: userId } });
        if (!user) {
            throw new NotFoundException('User not found');
        }

        const existingPin = await this.pinnedQuestionRepository.findOne({
            where: { userId, questionId },
        });

        if (existingPin) {
            return { message: 'Question is already pinned', pinned: true };
        }

        const pinnedQuestion = this.pinnedQuestionRepository.create({
            userId,
            questionId,
        });
        await this.pinnedQuestionRepository.save(pinnedQuestion);
        return { message: 'Question pinned successfully', pinned: true };
    }

    async unpinQuestion(questionId: string, userId: string): Promise<{ message: string; pinned: boolean }> {
        const pinnedQuestion = await this.pinnedQuestionRepository.findOne({
            where: { userId, questionId },
        });

        if (!pinnedQuestion) {
            throw new NotFoundException('Pinned question not found');
        }

        await this.pinnedQuestionRepository.remove(pinnedQuestion);
        return { message: 'Question unpinned successfully', pinned: false };
    }

    async togglePinQuestion(questionId: string, userId: string): Promise<{ message: string; pinned: boolean }> {
        const existingPin = await this.pinnedQuestionRepository.findOne({
            where: { userId, questionId },
        });

        if (existingPin) {
            return await this.unpinQuestion(questionId, userId);
        }
        return await this.pinQuestion(questionId, userId);
    }
}
