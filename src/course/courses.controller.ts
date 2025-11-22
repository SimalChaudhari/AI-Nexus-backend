//courses.controller.ts
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
    UseInterceptors,
    UploadedFile,
    ParseFilePipe,
    MaxFileSizeValidator,
    FileTypeValidator,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { UserRole } from '../user/users.entity';
import { Response } from 'express';
import { CourseService } from './courses.service';
import { CreateCourseDto, UpdateCourseDto } from './courses.dto';
import { JwtAuthGuard } from '../jwt/jwt-auth.guard';
import { RolesGuard } from '../jwt/roles.guard';
import { Roles } from '../jwt/roles.decorator';
import { SessionGuard } from '../jwt/session.guard';

@Controller('courses')
export class CourseController {
    private readonly baseUrl: string;

    constructor(private readonly courseService: CourseService) {
        // Ensure directory exists
        const courseImageDir = join(process.cwd(), 'assets', 'course');
        
        if (!existsSync(courseImageDir)) {
            mkdirSync(courseImageDir, { recursive: true });
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
    async getAllCourses(@Res() response: Response) {
        const courses = await this.courseService.getAll();
        // Transform image paths to full URLs
        const coursesWithUrls = courses.map(course => ({
            ...course,
            image: this.transformImageUrl(course.image),
        }));
        return response.status(HttpStatus.OK).json({
            length: coursesWithUrls.length,
            data: coursesWithUrls,
        });
    }

    @Get(':id')
    async getCourseById(@Param('id') id: string, @Res() response: Response) {
        const course = await this.courseService.getById(id);
        // Transform image path to full URL
        const courseWithUrl = {
            ...course,
            image: this.transformImageUrl(course.image),
        };
        return response.status(HttpStatus.OK).json({
            data: courseWithUrl,
        });
    }

    @Post()
    @UseGuards(SessionGuard, JwtAuthGuard, RolesGuard)
    @Roles(UserRole.Admin)
    @UseInterceptors(
        FileInterceptor('image', {
            storage: diskStorage({
                destination: (req, file, cb) => {
                    const uploadPath = join(process.cwd(), 'assets', 'course');
                    
                    if (!existsSync(uploadPath)) {
                        mkdirSync(uploadPath, { recursive: true });
                    }
                    cb(null, uploadPath);
                },
                filename: (req, file, cb) => {
                    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
                    const ext = extname(file.originalname);
                    cb(null, `course-${uniqueSuffix}${ext}`);
                },
            }),
            limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
        })
    )
    async createCourse(
        @Body() createCourseDto: CreateCourseDto,
        @Res() response: Response,
        @UploadedFile(
            new ParseFilePipe({
                fileIsRequired: false,
                validators: [
                    new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }), // 5MB
                    new FileTypeValidator({ fileType: /(jpg|jpeg|png|gif|webp)$/ }),
                ],
            })
        )
        file?: Express.Multer.File,
    ) {
        // Store file path instead of base64
        if (file) {
            createCourseDto.image = `/assets/course/${file.filename}`;
        }

        const result = await this.courseService.create(createCourseDto);
        // Transform image path to full URL
        const courseWithUrl = {
            ...result.course,
            image: this.transformImageUrl(result.course.image),
        };
        return response.status(HttpStatus.CREATED).json({
            message: result.message,
            course: courseWithUrl,
        });
    }

    @Put('update/:id')
    @UseGuards(SessionGuard, JwtAuthGuard, RolesGuard)
    @Roles(UserRole.Admin)
    @UseInterceptors(
        FileInterceptor('image', {
            storage: diskStorage({
                destination: (req, file, cb) => {
                    const uploadPath = join(process.cwd(), 'assets', 'course');
                    
                    if (!existsSync(uploadPath)) {
                        mkdirSync(uploadPath, { recursive: true });
                    }
                    cb(null, uploadPath);
                },
                filename: (req, file, cb) => {
                    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
                    const ext = extname(file.originalname);
                    cb(null, `course-${uniqueSuffix}${ext}`);
                },
            }),
            limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
        })
    )
    async updateCourse(
        @Param('id') id: string,
        @Body() updateCourseDto: UpdateCourseDto,
        @Res() response: Response,
        @UploadedFile(
            new ParseFilePipe({
                fileIsRequired: false,
                validators: [
                    new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }), // 5MB
                    new FileTypeValidator({ fileType: /(jpg|jpeg|png|gif|webp)$/ }),
                ],
            })
        )
        file?: Express.Multer.File,
    ) {
        // Store file path instead of base64
        if (file) {
            updateCourseDto.image = `/assets/course/${file.filename}`;
        }

        const result = await this.courseService.update(id, updateCourseDto);
        // Transform image path to full URL
        const courseWithUrl = {
            ...result.course,
            image: this.transformImageUrl(result.course.image),
        };
        return response.status(HttpStatus.OK).json({
            message: result.message,
            course: courseWithUrl,
        });
    }

    @Delete('delete/:id')
    @UseGuards(SessionGuard, JwtAuthGuard, RolesGuard)
    @Roles(UserRole.Admin)
    async deleteCourse(@Param('id') id: string, @Res() response: Response) {
        const result = await this.courseService.delete(id);
        return response.status(HttpStatus.OK).json(result);
    }
}

