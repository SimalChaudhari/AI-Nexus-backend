import {
    Controller,
    HttpStatus,
    Param,
    Get,
    Post,
    Delete,
    Put,
    Body,
    Res,
    UseGuards,
    Req,
} from '@nestjs/common';
import { UserRole } from '../user/users.entity';
import { Response, Request } from 'express';
import { QuestionService } from './questions.service';
import { CreateQuestionDto, UpdateQuestionDto, CreateQuestionCommentDto, UpdateQuestionCommentDto } from './questions.dto';
import { JwtAuthGuard } from '../jwt/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../jwt/optional-jwt-auth.guard';
import { RolesGuard } from '../jwt/roles.guard';
import { Roles } from '../jwt/roles.decorator';
import { SessionGuard } from '../jwt/session.guard';

@Controller('questions')
export class QuestionController {
    constructor(private readonly questionService: QuestionService) {}

    @Get()
    @UseGuards(OptionalJwtAuthGuard)
    async getAllQuestions(@Req() request: Request, @Res() response: Response) {
        const userId = request.user?.id;
        const questions = await this.questionService.getAll(userId);
        return response.status(HttpStatus.OK).json({
            length: questions.length,
            data: questions,
        });
    }

    @Post(':id/view')
    async incrementViewCount(@Param('id') id: string, @Res() response: Response) {
        const question = await this.questionService.incrementViewCount(id);
        return response.status(HttpStatus.OK).json({
            message: 'View count incremented',
            data: question,
        });
    }

    @Get(':id')
    @UseGuards(OptionalJwtAuthGuard)
    async getQuestionById(@Param('id') id: string, @Req() request: Request, @Res() response: Response) {
        const userId = request.user?.id;
        const question = await this.questionService.getById(id, userId);
        return response.status(HttpStatus.OK).json({
            data: question,
        });
    }

    @Post()
    @UseGuards(SessionGuard, JwtAuthGuard)
    async createQuestion(
        @Body() createQuestionDto: CreateQuestionDto,
        @Req() request: Request,
        @Res() response: Response,
    ) {
        const userId = request.user?.id;
        const result = await this.questionService.create(createQuestionDto, userId);
        return response.status(HttpStatus.CREATED).json(result);
    }

    @Put('update/:id')
    @UseGuards(SessionGuard, JwtAuthGuard)
    async updateQuestion(
        @Param('id') id: string,
        @Body() updateQuestionDto: UpdateQuestionDto,
        @Req() request: Request,
        @Res() response: Response,
    ) {
        const isAdmin = request.user?.role === UserRole.Admin;
        const userId = isAdmin ? undefined : request.user?.id;
        const result = await this.questionService.update(id, updateQuestionDto, userId);
        return response.status(HttpStatus.OK).json(result);
    }

    @Delete('delete/:id')
    @UseGuards(SessionGuard, JwtAuthGuard, RolesGuard)
    @Roles(UserRole.Admin)
    async deleteQuestion(@Param('id') id: string, @Res() response: Response) {
        const result = await this.questionService.delete(id);
        return response.status(HttpStatus.OK).json(result);
    }

    @Post(':id/comments')
    @UseGuards(SessionGuard, JwtAuthGuard)
    async addComment(
        @Param('id') questionId: string,
        @Body() createCommentDto: CreateQuestionCommentDto,
        @Req() request: Request,
        @Res() response: Response,
    ) {
        const userId = request.user?.id;
        if (!userId) {
            return response.status(HttpStatus.UNAUTHORIZED).json({
                message: 'User not authenticated',
            });
        }
        const result = await this.questionService.addComment(questionId, userId, createCommentDto);
        return response.status(HttpStatus.CREATED).json(result);
    }

    @Get(':id/comments')
    @UseGuards(OptionalJwtAuthGuard)
    async getComments(
        @Param('id') questionId: string,
        @Req() request: Request,
        @Res() response: Response,
    ) {
        const userId = request.user?.id;
        const comments = await this.questionService.getComments(questionId, userId);
        return response.status(HttpStatus.OK).json({
            length: comments.length,
            data: comments,
        });
    }

    @Put('comments/update/:id')
    @UseGuards(SessionGuard, JwtAuthGuard)
    async updateComment(
        @Param('id') commentId: string,
        @Body() updateCommentDto: UpdateQuestionCommentDto,
        @Req() request: Request,
        @Res() response: Response,
    ) {
        const userId = request.user?.id;
        if (!userId) {
            return response.status(HttpStatus.UNAUTHORIZED).json({
                message: 'User not authenticated',
            });
        }
        const result = await this.questionService.updateComment(commentId, userId, updateCommentDto);
        return response.status(HttpStatus.OK).json(result);
    }

    @Delete('comments/delete/:id')
    @UseGuards(SessionGuard, JwtAuthGuard)
    async deleteComment(
        @Param('id') commentId: string,
        @Req() request: Request,
        @Res() response: Response,
    ) {
        const userId = request.user?.id;
        if (!userId) {
            return response.status(HttpStatus.UNAUTHORIZED).json({
                message: 'User not authenticated',
            });
        }
        const result = await this.questionService.deleteComment(commentId, userId);
        return response.status(HttpStatus.OK).json(result);
    }

    @Post('comments/:id/like')
    @UseGuards(SessionGuard, JwtAuthGuard)
    async likeComment(
        @Param('id') commentId: string,
        @Req() request: Request,
        @Res() response: Response,
    ) {
        const userId = request.user?.id;
        if (!userId) {
            return response.status(HttpStatus.UNAUTHORIZED).json({ message: 'User not authenticated' });
        }
        const result = await this.questionService.likeComment(commentId, userId);
        return response.status(HttpStatus.OK).json(result);
    }

    @Delete('comments/:id/like')
    @UseGuards(SessionGuard, JwtAuthGuard)
    async unlikeComment(
        @Param('id') commentId: string,
        @Req() request: Request,
        @Res() response: Response,
    ) {
        const userId = request.user?.id;
        if (!userId) {
            return response.status(HttpStatus.UNAUTHORIZED).json({ message: 'User not authenticated' });
        }
        const result = await this.questionService.unlikeComment(commentId, userId);
        return response.status(HttpStatus.OK).json(result);
    }

    @Post('comments/:id/toggle-like')
    @UseGuards(SessionGuard, JwtAuthGuard)
    async toggleCommentLike(
        @Param('id') commentId: string,
        @Req() request: Request,
        @Res() response: Response,
    ) {
        const userId = request.user?.id;
        if (!userId) {
            return response.status(HttpStatus.UNAUTHORIZED).json({ message: 'User not authenticated' });
        }
        const result = await this.questionService.toggleCommentLike(commentId, userId);
        return response.status(HttpStatus.OK).json(result);
    }

    @Post(':id/pin')
    @UseGuards(SessionGuard, JwtAuthGuard)
    async pinQuestion(
        @Param('id') questionId: string,
        @Req() request: Request,
        @Res() response: Response,
    ) {
        const userId = request.user?.id;
        if (!userId) {
            return response.status(HttpStatus.UNAUTHORIZED).json({ message: 'User not authenticated' });
        }
        const result = await this.questionService.pinQuestion(questionId, userId);
        return response.status(HttpStatus.OK).json(result);
    }

    @Delete(':id/pin')
    @UseGuards(SessionGuard, JwtAuthGuard)
    async unpinQuestion(
        @Param('id') questionId: string,
        @Req() request: Request,
        @Res() response: Response,
    ) {
        const userId = request.user?.id;
        if (!userId) {
            return response.status(HttpStatus.UNAUTHORIZED).json({ message: 'User not authenticated' });
        }
        const result = await this.questionService.unpinQuestion(questionId, userId);
        return response.status(HttpStatus.OK).json(result);
    }

    @Post(':id/toggle-pin')
    @UseGuards(SessionGuard, JwtAuthGuard)
    async togglePinQuestion(
        @Param('id') questionId: string,
        @Req() request: Request,
        @Res() response: Response,
    ) {
        const userId = request.user?.id;
        if (!userId) {
            return response.status(HttpStatus.UNAUTHORIZED).json({ message: 'User not authenticated' });
        }
        const result = await this.questionService.togglePinQuestion(questionId, userId);
        return response.status(HttpStatus.OK).json(result);
    }
}
