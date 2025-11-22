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
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { UserRole } from '../user/users.entity';
import { Response } from 'express';
import { CommunityService } from './communities.service';
import { CreateCommunityDto, UpdateCommunityDto } from './communities.dto';
import { JwtAuthGuard } from '../jwt/jwt-auth.guard';
import { RolesGuard } from '../jwt/roles.guard';
import { Roles } from '../jwt/roles.decorator';
import { SessionGuard } from '../jwt/session.guard';

@Controller('communities')
export class CommunityController {
    private readonly baseUrl: string;

    constructor(private readonly communityService: CommunityService) {
        // Ensure directories exist
        const smallImageDir = join(process.cwd(), 'assets', 'community', 'small');
        const largeImageDir = join(process.cwd(), 'assets', 'community', 'large');
        
        if (!existsSync(smallImageDir)) {
            mkdirSync(smallImageDir, { recursive: true });
        }
        if (!existsSync(largeImageDir)) {
            mkdirSync(largeImageDir, { recursive: true });
        }

        // Get base URL from environment variable
        this.baseUrl = process.env.BACKEND_URL || 'http://localhost:3000';
    }

    /**
     * Transform image path to full URL
     */
    private transformImageUrl(imagePath?: string): string | undefined {
        if (!imagePath) return undefined;
        // If already a full URL, return as is
        if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
            return imagePath;
        }
        // If it's a base64 data URL, return as is
        if (imagePath.startsWith('data:')) {
            return imagePath;
        }
        // Otherwise, prepend base URL
        return `${this.baseUrl}${imagePath}`;
    }

    @Get()
    async getAllCommunities(@Res() response: Response) {
        const communities = await this.communityService.getAll();
        // Transform image paths to full URLs
        const communitiesWithUrls = communities.map(community => ({
            ...community,
            smallImage: this.transformImageUrl(community.smallImage),
            largeImage: this.transformImageUrl(community.largeImage),
        }));
        return response.status(HttpStatus.OK).json({
            length: communitiesWithUrls.length,
            data: communitiesWithUrls,
        });
    }

    @Get(':id')
    async getCommunityById(@Param('id') id: string, @Res() response: Response) {
        const community = await this.communityService.getById(id);
        // Transform image paths to full URLs
        const communityWithUrls = {
            ...community,
            smallImage: this.transformImageUrl(community.smallImage),
            largeImage: this.transformImageUrl(community.largeImage),
        };
        return response.status(HttpStatus.OK).json({
            data: communityWithUrls,
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
            storage: diskStorage({
                destination: (req, file, cb) => {
                    const uploadPath = file.fieldname === 'smallImage'
                        ? join(process.cwd(), 'assets', 'community', 'small')
                        : join(process.cwd(), 'assets', 'community', 'large');
                    
                    if (!existsSync(uploadPath)) {
                        mkdirSync(uploadPath, { recursive: true });
                    }
                    cb(null, uploadPath);
                },
                filename: (req, file, cb) => {
                    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
                    const ext = extname(file.originalname);
                    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
                },
            }),
            limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit per file
        })
    )
    async createCommunity(
        @Body() createCommunityDto: CreateCommunityDto,
        @Res() response: Response,
        @UploadedFiles()
        files?: { smallImage?: Express.Multer.File[]; largeImage?: Express.Multer.File[] },
    ) {
        // Store file paths instead of base64
        if (files) {
            if (files.smallImage && files.smallImage[0]) {
                const file = files.smallImage[0];
                createCommunityDto.smallImage = `/assets/community/small/${file.filename}`;
            }

            if (files.largeImage && files.largeImage[0]) {
                const file = files.largeImage[0];
                createCommunityDto.largeImage = `/assets/community/large/${file.filename}`;
            }
        }

        const result = await this.communityService.create(createCommunityDto);
        // Transform image paths to full URLs
        const communityWithUrls = {
            ...result.community,
            smallImage: this.transformImageUrl(result.community.smallImage),
            largeImage: this.transformImageUrl(result.community.largeImage),
        };
        return response.status(HttpStatus.CREATED).json({
            message: result.message,
            community: communityWithUrls,
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
            storage: diskStorage({
                destination: (req, file, cb) => {
                    const uploadPath = file.fieldname === 'smallImage'
                        ? join(process.cwd(), 'assets', 'community', 'small')
                        : join(process.cwd(), 'assets', 'community', 'large');
                    
                    if (!existsSync(uploadPath)) {
                        mkdirSync(uploadPath, { recursive: true });
                    }
                    cb(null, uploadPath);
                },
                filename: (req, file, cb) => {
                    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
                    const ext = extname(file.originalname);
                    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
                },
            }),
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
        // Store file paths instead of base64
        if (files) {
            if (files.smallImage && files.smallImage[0]) {
                const file = files.smallImage[0];
                updateCommunityDto.smallImage = `/assets/community/small/${file.filename}`;
            }

            if (files.largeImage && files.largeImage[0]) {
                const file = files.largeImage[0];
                updateCommunityDto.largeImage = `/assets/community/large/${file.filename}`;
            }
        }

        const result = await this.communityService.update(id, updateCommunityDto);
        // Transform image paths to full URLs
        const communityWithUrls = {
            ...result.community,
            smallImage: this.transformImageUrl(result.community.smallImage),
            largeImage: this.transformImageUrl(result.community.largeImage),
        };
        return response.status(HttpStatus.OK).json({
            message: result.message,
            community: communityWithUrls,
        });
    }

    @Delete('delete/:id')
    @UseGuards(SessionGuard, JwtAuthGuard, RolesGuard)
    @Roles(UserRole.Admin)
    async deleteCommunity(@Param('id') id: string, @Res() response: Response) {
        const result = await this.communityService.delete(id);
        return response.status(HttpStatus.OK).json(result);
    }
}

