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
import { AnnouncementService } from './announcements.service';
import { CreateAnnouncementDto, UpdateAnnouncementDto, CreateCommentDto, UpdateCommentDto } from './announcements.dto';
import { JwtAuthGuard } from '../jwt/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../jwt/optional-jwt-auth.guard';
import { RolesGuard } from '../jwt/roles.guard';
import { Roles } from '../jwt/roles.decorator';
import { SessionGuard } from '../jwt/session.guard';

@Controller('announcements')
export class AnnouncementController {
    constructor(private readonly announcementService: AnnouncementService) {}

    @Get()
    @UseGuards(OptionalJwtAuthGuard)
    async getAllAnnouncements(@Req() request: Request, @Res() response: Response) {
        const userId = request.user?.id;
        console.log('🔍 getAllAnnouncements - userId:', userId ? userId.substring(0, 8) + '...' : 'not logged in');
        const announcements = await this.announcementService.getAll(userId);
        const pinnedCount = announcements.filter((a: any) => a.isPinned).length;
        console.log(`📌 Found ${pinnedCount} pinned announcements out of ${announcements.length} total`);
        return response.status(HttpStatus.OK).json({
            length: announcements.length,
            data: announcements,
        });
    }

    @Post(':id/view')
    async incrementViewCount(@Param('id') id: string, @Res() response: Response) {
        const announcement = await this.announcementService.incrementViewCount(id);
        return response.status(HttpStatus.OK).json({
            message: 'View count incremented',
            data: announcement,
        });
    }

    @Get(':id')
    @UseGuards(OptionalJwtAuthGuard)
    async getAnnouncementById(
        @Param('id') id: string,
        @Req() request: Request,
        @Res() response: Response,
    ) {
        const userId = request.user?.id;
        const announcement = await this.announcementService.getById(id, userId);
        return response.status(HttpStatus.OK).json({
            data: announcement,
        });
    }

    @Post()
    @UseGuards(SessionGuard, JwtAuthGuard, RolesGuard)
    @Roles(UserRole.Admin)
    async createAnnouncement(
        @Body() createAnnouncementDto: CreateAnnouncementDto,
        @Res() response: Response,
    ) {
        const result = await this.announcementService.create(createAnnouncementDto);
        return response.status(HttpStatus.CREATED).json(result);
    }

    @Put('update/:id')
    @UseGuards(SessionGuard, JwtAuthGuard, RolesGuard)
    @Roles(UserRole.Admin)
    async updateAnnouncement(
        @Param('id') id: string,
        @Body() updateAnnouncementDto: UpdateAnnouncementDto,
        @Res() response: Response,
    ) {
        const result = await this.announcementService.update(id, updateAnnouncementDto);
        return response.status(HttpStatus.OK).json(result);
    }

    @Delete('delete/:id')
    @UseGuards(SessionGuard, JwtAuthGuard, RolesGuard)
    @Roles(UserRole.Admin)
    async deleteAnnouncement(@Param('id') id: string, @Res() response: Response) {
        const result = await this.announcementService.delete(id);
        return response.status(HttpStatus.OK).json(result);
    }

    @Post(':id/comments')
    @UseGuards(SessionGuard, JwtAuthGuard)
    async addComment(
        @Param('id') announcementId: string,
        @Body() createCommentDto: CreateCommentDto,
        @Req() request: Request,
        @Res() response: Response,
    ) {
        const userId = request.user?.id;
        if (!userId) {
            return response.status(HttpStatus.UNAUTHORIZED).json({
                message: 'User not authenticated',
            });
        }
        const result = await this.announcementService.addComment(announcementId, userId, createCommentDto);
        return response.status(HttpStatus.CREATED).json(result);
    }

    @Get(':id/comments')
    async getComments(@Param('id') announcementId: string, @Res() response: Response) {
        const comments = await this.announcementService.getComments(announcementId);
        return response.status(HttpStatus.OK).json({
            length: comments.length,
            data: comments,
        });
    }

    @Put('comments/update/:id')
    @UseGuards(SessionGuard, JwtAuthGuard)
    async updateComment(
        @Param('id') commentId: string,
        @Body() updateCommentDto: UpdateCommentDto,
        @Req() request: Request,
        @Res() response: Response,
    ) {
        const userId = request.user?.id;
        if (!userId) {
            return response.status(HttpStatus.UNAUTHORIZED).json({
                message: 'User not authenticated',
            });
        }
        const result = await this.announcementService.updateComment(commentId, userId, updateCommentDto);
        return response.status(HttpStatus.OK).json(result);
    }

    @Delete('comments/delete/:id')
    @UseGuards(SessionGuard, JwtAuthGuard)
    async deleteComment(@Param('id') commentId: string, @Res() response: Response) {
        const result = await this.announcementService.deleteComment(commentId);
        return response.status(HttpStatus.OK).json(result);
    }

    @Post(':id/pin')
    @UseGuards(SessionGuard, JwtAuthGuard)
    async pinAnnouncement(
        @Param('id') announcementId: string,
        @Req() request: Request,
        @Res() response: Response,
    ) {
        const userId = request.user?.id;
        if (!userId) {
            return response.status(HttpStatus.UNAUTHORIZED).json({
                message: 'User not authenticated',
            });
        }
        const result = await this.announcementService.pinAnnouncement(announcementId, userId);
        return response.status(HttpStatus.OK).json(result);
    }

    @Delete(':id/pin')
    @UseGuards(SessionGuard, JwtAuthGuard)
    async unpinAnnouncement(
        @Param('id') announcementId: string,
        @Req() request: Request,
        @Res() response: Response,
    ) {
        const userId = request.user?.id;
        if (!userId) {
            return response.status(HttpStatus.UNAUTHORIZED).json({
                message: 'User not authenticated',
            });
        }
        const result = await this.announcementService.unpinAnnouncement(announcementId, userId);
        return response.status(HttpStatus.OK).json(result);
    }

    @Post(':id/toggle-pin')
    @UseGuards(SessionGuard, JwtAuthGuard)
    async togglePinAnnouncement(
        @Param('id') announcementId: string,
        @Req() request: Request,
        @Res() response: Response,
    ) {
        const userId = request.user?.id;
        if (!userId) {
            return response.status(HttpStatus.UNAUTHORIZED).json({
                message: 'User not authenticated',
            });
        }
        const result = await this.announcementService.togglePinAnnouncement(announcementId, userId);
        return response.status(HttpStatus.OK).json(result);
    }
}
