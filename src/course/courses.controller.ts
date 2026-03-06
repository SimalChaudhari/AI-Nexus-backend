//courses.controller.ts
import {
    Controller,
    HttpStatus,
    Param,
    Get,
    Post,
    Delete,
    Put,
    Patch,
    Body,
    Req,
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
import { Response, Request } from 'express';
import { UserRole } from '../user/users.entity';
import { CourseService } from './courses.service';
import { CreateCourseDto, UpdateCourseDto } from './courses.dto';
import { JwtAuthGuard } from '../jwt/jwt-auth.guard';
import { RolesGuard } from '../jwt/roles.guard';
import { Roles } from '../jwt/roles.decorator';
import { SessionGuard } from '../jwt/session.guard';
import { CloudinaryService } from '../service/cloudinary.service';
import { CourseModuleService } from './course-module.service';
import { CreateCourseModuleDto, UpdateCourseModuleDto } from './course-module.dto';
import { CourseModuleSectionService } from './course-module-section.service';
import {
  CreateCourseModuleSectionDto,
  UpdateCourseModuleSectionDto,
} from './course-module-section.dto';
import { CourseProgressService } from './course-progress.service';
import { UpdateCourseProgressDto } from './course-progress.dto';

@Controller('courses')
export class CourseController {
    constructor(
        private readonly courseService: CourseService,
        private readonly cloudinaryService: CloudinaryService,
        private readonly courseModuleService: CourseModuleService,
        private readonly courseModuleSectionService: CourseModuleSectionService,
        private readonly courseProgressService: CourseProgressService,
    ) {}

    @Get()
    async getAllCourses(@Res() response: Response) {
        const courses = await this.courseService.getAll();
        return response.status(HttpStatus.OK).json({
            length: courses.length,
            data: courses,
        });
    }

    @Get(':courseId/modules/with-sections')
    async getCourseModulesWithSections(
        @Param('courseId') courseId: string,
        @Res() response: Response,
    ) {
        const modules = await this.courseModuleService.findByCourseId(courseId);
        const withSections = await Promise.all(
            modules.map(async (mod) => {
                const sections = await this.courseModuleSectionService.findByModuleId(mod.id);
                return { ...mod, sections };
            }),
        );
        return response.status(HttpStatus.OK).json({ data: withSections });
    }

    @Get(':courseId/modules/:moduleId/sections')
    async getModuleSections(
        @Param('moduleId') moduleId: string,
        @Res() response: Response,
    ) {
        const sections = await this.courseModuleSectionService.findByModuleId(moduleId);
        return response.status(HttpStatus.OK).json({ data: sections });
    }

    @Get(':courseId/modules')
    async getCourseModules(@Param('courseId') courseId: string, @Res() response: Response) {
        const modules = await this.courseModuleService.findByCourseId(courseId);
        return response.status(HttpStatus.OK).json({
            data: modules,
        });
    }

    @Get(':courseId/progress')
    @UseGuards(SessionGuard, JwtAuthGuard)
    async getCourseProgress(
        @Param('courseId') courseId: string,
        @Req() request: Request,
        @Res() response: Response,
    ) {
        const userId = (request as any).user?.id;
        if (!userId) {
            return response.status(HttpStatus.UNAUTHORIZED).json({ message: 'Unauthorized' });
        }
        const progress = await this.courseProgressService.getProgress(userId, courseId);
        return response.status(HttpStatus.OK).json({
            data: progress
                ? {
                    currentSectionId: progress.currentSectionId,
                    lastAccessedAt: progress.lastAccessedAt,
                    viewedSectionIds: progress.viewedSectionIds ?? [],
                  }
                : null,
        });
    }

    @Patch(':courseId/progress')
    @UseGuards(SessionGuard, JwtAuthGuard)
    async updateCourseProgress(
        @Param('courseId') courseId: string,
        @Body() dto: UpdateCourseProgressDto,
        @Req() request: Request,
        @Res() response: Response,
    ) {
        const userId = (request as any).user?.id;
        if (!userId) {
            return response.status(HttpStatus.UNAUTHORIZED).json({ message: 'Unauthorized' });
        }
        const progress = await this.courseProgressService.upsertProgress(userId, courseId, dto);
        return response.status(HttpStatus.OK).json({
            message: 'Progress updated',
            data: {
                currentSectionId: progress.currentSectionId,
                lastAccessedAt: progress.lastAccessedAt,
                viewedSectionIds: progress.viewedSectionIds ?? [],
            },
        });
    }

    @Get(':id')
    async getCourseById(@Param('id') id: string, @Res() response: Response) {
        const course = await this.courseService.getById(id);
        return response.status(HttpStatus.OK).json({
            data: course,
        });
    }

    @Post(':courseId/modules/:moduleId/sections')
    @UseGuards(SessionGuard, JwtAuthGuard, RolesGuard)
    @Roles(UserRole.Admin)
    async createModuleSection(
        @Param('moduleId') moduleId: string,
        @Body() dto: CreateCourseModuleSectionDto,
        @Res() response: Response,
    ) {
        const section = await this.courseModuleSectionService.create(moduleId, dto);
        return response.status(HttpStatus.CREATED).json({
            message: 'Section created successfully',
            data: section,
        });
    }

    @Put('modules/sections/:id')
    @UseGuards(SessionGuard, JwtAuthGuard, RolesGuard)
    @Roles(UserRole.Admin)
    async updateModuleSection(
        @Param('id') id: string,
        @Body() dto: UpdateCourseModuleSectionDto,
        @Res() response: Response,
    ) {
        const section = await this.courseModuleSectionService.update(id, dto);
        return response.status(HttpStatus.OK).json({
            message: 'Section updated successfully',
            data: section,
        });
    }

    @Delete('modules/sections/:id')
    @UseGuards(SessionGuard, JwtAuthGuard, RolesGuard)
    @Roles(UserRole.Admin)
    async deleteModuleSection(@Param('id') id: string, @Res() response: Response) {
        const result = await this.courseModuleSectionService.delete(id);
        return response.status(HttpStatus.OK).json(result);
    }

    @Post(':courseId/modules')
    @UseGuards(SessionGuard, JwtAuthGuard, RolesGuard)
    @Roles(UserRole.Admin)
    async createCourseModule(
        @Param('courseId') courseId: string,
        @Body() dto: CreateCourseModuleDto,
        @Res() response: Response,
    ) {
        const module = await this.courseModuleService.create(courseId, dto);
        return response.status(HttpStatus.CREATED).json({
            message: 'Module created successfully',
            data: module,
        });
    }

    @Put('modules/:id')
    @UseGuards(SessionGuard, JwtAuthGuard, RolesGuard)
    @Roles(UserRole.Admin)
    async updateCourseModule(
        @Param('id') id: string,
        @Body() dto: UpdateCourseModuleDto,
        @Res() response: Response,
    ) {
        const module = await this.courseModuleService.update(id, dto);
        return response.status(HttpStatus.OK).json({
            message: 'Module updated successfully',
            data: module,
        });
    }

    @Delete('modules/:id')
    @UseGuards(SessionGuard, JwtAuthGuard, RolesGuard)
    @Roles(UserRole.Admin)
    async deleteCourseModule(@Param('id') id: string, @Res() response: Response) {
        const result = await this.courseModuleService.delete(id);
        return response.status(HttpStatus.OK).json(result);
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

