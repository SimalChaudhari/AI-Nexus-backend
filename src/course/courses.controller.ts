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
import { memoryStorage } from 'multer';
import { UserRole } from '../user/users.entity';
import { Response } from 'express';
import { CourseService } from './courses.service';
import { CreateCourseDto, UpdateCourseDto } from './courses.dto';
import { JwtAuthGuard } from '../jwt/jwt-auth.guard';
import { RolesGuard } from '../jwt/roles.guard';
import { Roles } from '../jwt/roles.decorator';
import { SessionGuard } from '../jwt/session.guard';
import { CloudinaryService } from '../service/cloudinary.service';

@Controller('courses')
export class CourseController {
    constructor(
        private readonly courseService: CourseService,
        private readonly cloudinaryService: CloudinaryService,
    ) {}

    @Get()
    async getAllCourses(@Res() response: Response) {
        const courses = await this.courseService.getAll();
        return response.status(HttpStatus.OK).json({
            length: courses.length,
            data: courses,
        });
    }

    @Get(':id')
    async getCourseById(@Param('id') id: string, @Res() response: Response) {
        const course = await this.courseService.getById(id);
        return response.status(HttpStatus.OK).json({
            data: course,
        });
    }

    @Post()
    @UseGuards(SessionGuard, JwtAuthGuard, RolesGuard)
    @Roles(UserRole.Admin)
    @UseInterceptors(
        FileInterceptor('image', {
            storage: memoryStorage(),
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
        // Upload image to Cloudinary
        if (file) {
            const imageUrl = await this.cloudinaryService.uploadImage(file, 'course');
            createCourseDto.image = imageUrl;
        }

        const result = await this.courseService.create(createCourseDto);
        return response.status(HttpStatus.CREATED).json({
            message: result.message,
            course: result.course,
        });
    }

    @Put('update/:id')
    @UseGuards(SessionGuard, JwtAuthGuard, RolesGuard)
    @Roles(UserRole.Admin)
    @UseInterceptors(
        FileInterceptor('image', {
            storage: memoryStorage(),
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
        // Get existing course to delete old image if new one is uploaded or deleted
        const existingCourse = await this.courseService.getById(id);

        // Handle image: file = new upload, empty string = delete, undefined = keep existing
        if (file) {
            // Delete old image if it exists and is from Cloudinary
            if (existingCourse.image && existingCourse.image.startsWith('http')) {
                await this.cloudinaryService.deleteImage(existingCourse.image);
            }
            const imageUrl = await this.cloudinaryService.uploadImage(file, 'course');
            updateCourseDto.image = imageUrl;
        } else if (updateCourseDto.image === '') {
            // Explicit deletion requested (empty string sent from frontend)
            // Delete old image from Cloudinary if it exists
            if (existingCourse.image && existingCourse.image.startsWith('http')) {
                await this.cloudinaryService.deleteImage(existingCourse.image);
            }
            // Keep empty string - service will handle it to clear the image
        }
        // If no file and image is not empty string, don't update image field (keep existing)

        const result = await this.courseService.update(id, updateCourseDto);
        return response.status(HttpStatus.OK).json({
            message: result.message,
            course: result.course,
        });
    }

    @Delete('delete/:id')
    @UseGuards(SessionGuard, JwtAuthGuard, RolesGuard)
    @Roles(UserRole.Admin)
    async deleteCourse(@Param('id') id: string, @Res() response: Response) {
        // Get course before deleting to access image URL
        const course = await this.courseService.getById(id);
        
        // Delete image from Cloudinary if it exists
        if (course.image && course.image.startsWith('http')) {
            try {
                await this.cloudinaryService.deleteImage(course.image);
            } catch (error) {
                console.error('Error deleting image from Cloudinary:', error);
            }
        }

        const result = await this.courseService.delete(id);
        return response.status(HttpStatus.OK).json(result);
    }
}

