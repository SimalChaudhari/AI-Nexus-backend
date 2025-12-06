//communities.controller.ts
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
    Req,
    UseGuards,
    UseInterceptors,
    UploadedFiles,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { UserRole } from '../user/users.entity';
import { Response } from 'express';
import { CommunityService } from './communities.service';
import { CreateCommunityDto, UpdateCommunityDto } from './communities.dto';
import { JwtAuthGuard } from '../jwt/jwt-auth.guard';
import { RolesGuard } from '../jwt/roles.guard';
import { Roles } from '../jwt/roles.decorator';
import { SessionGuard } from '../jwt/session.guard';
import { CloudinaryService } from '../service/cloudinary.service';

@Controller('communities')
export class CommunityController {
    constructor(
        private readonly communityService: CommunityService,
        private readonly cloudinaryService: CloudinaryService,
    ) {}

    @Get()
    async getAllCommunities(@Res() response: Response) {
        const communities = await this.communityService.getAll();
        return response.status(HttpStatus.OK).json({
            length: communities.length,
            data: communities,
        });
    }

    @Get(':id')
    async getCommunityById(@Param('id') id: string, @Res() response: Response) {
        const community = await this.communityService.getById(id);
        return response.status(HttpStatus.OK).json({
            data: community,
        });
    }

    @Post()
    @UseGuards(SessionGuard, JwtAuthGuard, RolesGuard)
    @Roles(UserRole.Admin)
    @UseInterceptors(
        FileFieldsInterceptor([
            { name: 'smallImage', maxCount: 1 },
            { name: 'largeImage', maxCount: 1 },
        ], {
            storage: memoryStorage(),
            limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit per file
        })
    )
    async createCommunity(
        @Body() createCommunityDto: CreateCommunityDto,
        @Res() response: Response,
        @UploadedFiles()
        files?: { smallImage?: Express.Multer.File[]; largeImage?: Express.Multer.File[] },
    ) {
        // Upload images to Cloudinary
        if (files) {
            if (files.smallImage && files.smallImage[0]) {
                const file = files.smallImage[0];
                const imageUrl = await this.cloudinaryService.uploadImage(file, 'community/small');
                createCommunityDto.smallImage = imageUrl;
            }

            if (files.largeImage && files.largeImage[0]) {
                const file = files.largeImage[0];
                const imageUrl = await this.cloudinaryService.uploadImage(file, 'community/large');
                createCommunityDto.largeImage = imageUrl;
            }
        }

        const result = await this.communityService.create(createCommunityDto);
        return response.status(HttpStatus.CREATED).json({
            message: result.message,
            community: result.community,
        });
    }

    @Put('update/:id')
    @UseGuards(SessionGuard, JwtAuthGuard, RolesGuard)
    @Roles(UserRole.Admin)
    @UseInterceptors(
        FileFieldsInterceptor([
            { name: 'smallImage', maxCount: 1 },
            { name: 'largeImage', maxCount: 1 },
        ], {
            storage: memoryStorage(),
            limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit per file
        })
    )
    async updateCommunity(
        @Param('id') id: string,
        @Body() updateCommunityDto: UpdateCommunityDto,
        @Res() response: Response,
        @UploadedFiles()
        files?: { smallImage?: Express.Multer.File[]; largeImage?: Express.Multer.File[] },
    ) {
        // Get existing community to delete old images if new ones are uploaded
        const existingCommunity = await this.communityService.getById(id);

        // Upload new images to Cloudinary and delete old ones if replaced
        if (files) {
            if (files.smallImage && files.smallImage[0]) {
                // Delete old image if it exists and is from Cloudinary
                if (existingCommunity.smallImage && existingCommunity.smallImage.startsWith('http')) {
                    await this.cloudinaryService.deleteImage(existingCommunity.smallImage);
                }
                const file = files.smallImage[0];
                const imageUrl = await this.cloudinaryService.uploadImage(file, 'community/small');
                updateCommunityDto.smallImage = imageUrl;
            }

            if (files.largeImage && files.largeImage[0]) {
                // Delete old image if it exists and is from Cloudinary
                if (existingCommunity.largeImage && existingCommunity.largeImage.startsWith('http')) {
                    await this.cloudinaryService.deleteImage(existingCommunity.largeImage);
                }
                const file = files.largeImage[0];
                const imageUrl = await this.cloudinaryService.uploadImage(file, 'community/large');
                updateCommunityDto.largeImage = imageUrl;
            }
        }

        const result = await this.communityService.update(id, updateCommunityDto);
        return response.status(HttpStatus.OK).json({
            message: result.message,
            community: result.community,
        });
    }

    @Delete('delete/:id')
    @UseGuards(SessionGuard, JwtAuthGuard, RolesGuard)
    @Roles(UserRole.Admin)
    async deleteCommunity(@Param('id') id: string, @Res() response: Response) {
        // Get community before deleting to access image URLs
        const community = await this.communityService.getById(id);
        
        // Delete images from Cloudinary if they exist
        if (community.smallImage && community.smallImage.startsWith('http')) {
            try {
                await this.cloudinaryService.deleteImage(community.smallImage);
            } catch (error) {
                console.error('Error deleting small image from Cloudinary:', error);
            }
        }
        if (community.largeImage && community.largeImage.startsWith('http')) {
            try {
                await this.cloudinaryService.deleteImage(community.largeImage);
            } catch (error) {
                console.error('Error deleting large image from Cloudinary:', error);
            }
        }

        const result = await this.communityService.delete(id);
        return response.status(HttpStatus.OK).json(result);
    }
}

