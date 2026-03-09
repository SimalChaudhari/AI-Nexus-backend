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
    UploadedFiles,
    ParseFilePipe,
    MaxFileSizeValidator,
    FileTypeValidator,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
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
import { CourseFavoriteService } from './course-favorite.service';
import { CourseSectionFavoriteService } from './course-section-favorite.service';
import { CourseEnrollmentService } from './course-enrollment.service';
import { OptionalJwtAuthGuard } from '../jwt/optional-jwt-auth.guard';

@Controller('courses')
export class CourseController {
    constructor(
        private readonly courseService: CourseService,
        private readonly cloudinaryService: CloudinaryService,
        private readonly courseModuleService: CourseModuleService,
        private readonly courseModuleSectionService: CourseModuleSectionService,
        private readonly courseProgressService: CourseProgressService,
        private readonly courseFavoriteService: CourseFavoriteService,
        private readonly courseSectionFavoriteService: CourseSectionFavoriteService,
        private readonly courseEnrollmentService: CourseEnrollmentService,
    ) {}

    @Get()
    @UseGuards(OptionalJwtAuthGuard)
    async getAllCourses(@Req() request: Request, @Res() response: Response) {
        const courses = await this.courseService.getAll();
        const userId = (request as any).user?.id;
        
        // If user is authenticated, include favorite status
        if (userId) {
            const favoriteCourseIds = await this.courseFavoriteService.getUserFavoriteCourseIds(userId);
            const coursesWithFavorites = courses.map((course) => ({
                ...course,
                isFavorite: favoriteCourseIds.includes(course.id),
            }));
            return response.status(HttpStatus.OK).json({
                length: coursesWithFavorites.length,
                data: coursesWithFavorites,
            });
        }
        
        // Return courses without favorite status for unauthenticated users
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

    @Get('enrolled/list')
    @UseGuards(SessionGuard, JwtAuthGuard)
    async getEnrolledCourseIds(
        @Req() request: Request,
        @Res() response: Response,
    ) {
        const userId = (request as any).user?.id;
        if (!userId) {
            return response.status(HttpStatus.UNAUTHORIZED).json({ message: 'Unauthorized' });
        }
        const courseIds = await this.courseEnrollmentService.getEnrolledCourseIds(userId);
        return response.status(HttpStatus.OK).json({ data: { courseIds } });
    }

    @Get(':courseId/enrolled')
    @UseGuards(SessionGuard, JwtAuthGuard)
    async getCourseEnrolled(
        @Param('courseId') courseId: string,
        @Req() request: Request,
        @Res() response: Response,
    ) {
        const userId = (request as any).user?.id;
        if (!userId) {
            return response.status(HttpStatus.UNAUTHORIZED).json({ message: 'Unauthorized' });
        }
        const enrolled = await this.courseEnrollmentService.isEnrolled(userId, courseId);
        return response.status(HttpStatus.OK).json({ data: { enrolled } });
    }

    @Post('enroll/bulk')
    @UseGuards(SessionGuard, JwtAuthGuard)
    async enrollBulk(
        @Body() body: { courseIds?: string[] },
        @Req() request: Request,
        @Res() response: Response,
    ) {
        const userId = (request as any).user?.id;
        if (!userId) {
            return response.status(HttpStatus.UNAUTHORIZED).json({ message: 'Unauthorized' });
        }
        const courseIds = Array.isArray(body?.courseIds) ? body.courseIds : [];
        await this.courseEnrollmentService.enrollMany(userId, courseIds);
        return response.status(HttpStatus.OK).json({ message: 'Enrolled', data: { count: courseIds.length } });
    }

    @Post(':courseId/enroll')
    @UseGuards(SessionGuard, JwtAuthGuard)
    async enrollCourse(
        @Param('courseId') courseId: string,
        @Req() request: Request,
        @Res() response: Response,
    ) {
        const userId = (request as any).user?.id;
        if (!userId) {
            return response.status(HttpStatus.UNAUTHORIZED).json({ message: 'Unauthorized' });
        }
        await this.courseService.getById(courseId); // ensure course exists
        await this.courseEnrollmentService.enroll(userId, courseId);
        return response.status(HttpStatus.OK).json({ message: 'Enrolled', data: { enrolled: true } });
    }

    @Get(':id')
    @UseGuards(OptionalJwtAuthGuard)
    async getCourseById(@Param('id') id: string, @Req() request: Request, @Res() response: Response) {
        const course = await this.courseService.getById(id);
        const userId = (request as any).user?.id;
        
        // If user is authenticated, include favorite status
        if (userId) {
            const isFavorite = await this.courseFavoriteService.isFavorite(userId, id);
            return response.status(HttpStatus.OK).json({
                data: { ...course, isFavorite },
            });
        }
        
        // Return course without favorite status for unauthenticated users
        return response.status(HttpStatus.OK).json({
            data: course,
        });
    }

    @Post('modules/sections/upload-images')
    @UseGuards(SessionGuard, JwtAuthGuard, RolesGuard)
    @Roles(UserRole.Admin)
    @UseInterceptors(
        FilesInterceptor('images', 20, {
            storage: memoryStorage(),
            limits: { fileSize: 5 * 1024 * 1024 },
            fileFilter: (_req, file, cb) => {
                const allowed = /^image\/(jpeg|jpg|png|gif|webp)$/i.test(file.mimetype);
                cb(null, allowed);
            },
        }),
    )
    async uploadSectionImages(
        @UploadedFiles() files: Express.Multer.File[],
        @Res() response: Response,
    ) {
        if (!files?.length) {
            return response.status(HttpStatus.BAD_REQUEST).json({
                message: 'No images uploaded',
            });
        }
        const urls = await this.cloudinaryService.uploadMultipleImages(files, 'course-section');
        return response.status(HttpStatus.OK).json({ data: { urls } });
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

    @Post(':id/favorite')
    @UseGuards(SessionGuard, JwtAuthGuard)
    async toggleFavorite(
        @Param('id') courseId: string,
        @Req() request: Request,
        @Res() response: Response,
    ) {
        const userId = (request as any).user?.id;
        if (!userId) {
            return response.status(HttpStatus.UNAUTHORIZED).json({ message: 'Unauthorized' });
        }
        
        // Verify course exists
        await this.courseService.getById(courseId);
        
        const result = await this.courseFavoriteService.toggleFavorite(userId, courseId);
        return response.status(HttpStatus.OK).json({
            message: result.isFavorite ? 'Course added to favorites' : 'Course removed from favorites',
            data: result,
        });
    }

    @Get(':id/favorite-status')
    @UseGuards(SessionGuard, JwtAuthGuard)
    async getFavoriteStatus(
        @Param('id') courseId: string,
        @Req() request: Request,
        @Res() response: Response,
    ) {
        const userId = (request as any).user?.id;
        if (!userId) {
            return response.status(HttpStatus.UNAUTHORIZED).json({ message: 'Unauthorized' });
        }
        
        const isFavorite = await this.courseFavoriteService.isFavorite(userId, courseId);
        return response.status(HttpStatus.OK).json({
            data: { isFavorite },
        });
    }

    @Get('favorites/list')
    @UseGuards(SessionGuard, JwtAuthGuard)
    async getUserFavorites(
        @Req() request: Request,
        @Res() response: Response,
    ) {
        const userId = (request as any).user?.id;
        if (!userId) {
            return response.status(HttpStatus.UNAUTHORIZED).json({ message: 'Unauthorized' });
        }
        
        const favorites = await this.courseFavoriteService.getUserFavorites(userId);
        const courses = favorites.map((f) => ({ ...f.course, isFavorite: true }));
        
        return response.status(HttpStatus.OK).json({
            length: courses.length,
            data: courses,
        });
    }

    // Section (Lesson) Favorites
    @Post('sections/:sectionId/favorite')
    @UseGuards(SessionGuard, JwtAuthGuard)
    async toggleSectionFavorite(
        @Param('sectionId') sectionId: string,
        @Req() request: Request,
        @Res() response: Response,
    ) {
        const userId = (request as any).user?.id;
        if (!userId) {
            return response.status(HttpStatus.UNAUTHORIZED).json({ message: 'Unauthorized' });
        }
        
        // Verify section exists (foreign key constraint will handle validation)
        
        const result = await this.courseSectionFavoriteService.toggleFavorite(userId, sectionId);
        return response.status(HttpStatus.OK).json({
            message: result.isFavorite ? 'Section added to favorites' : 'Section removed from favorites',
            data: result,
        });
    }

    @Get('sections/:sectionId/favorite-status')
    @UseGuards(SessionGuard, JwtAuthGuard)
    async getSectionFavoriteStatus(
        @Param('sectionId') sectionId: string,
        @Req() request: Request,
        @Res() response: Response,
    ) {
        const userId = (request as any).user?.id;
        if (!userId) {
            return response.status(HttpStatus.UNAUTHORIZED).json({ message: 'Unauthorized' });
        }
        
        const isFavorite = await this.courseSectionFavoriteService.isFavorite(userId, sectionId);
        return response.status(HttpStatus.OK).json({
            data: { isFavorite },
        });
    }

    @Get(':courseId/sections/favorites')
    @UseGuards(SessionGuard, JwtAuthGuard)
    async getCourseSectionFavorites(
        @Param('courseId') courseId: string,
        @Req() request: Request,
        @Res() response: Response,
    ) {
        const userId = (request as any).user?.id;
        if (!userId) {
            return response.status(HttpStatus.UNAUTHORIZED).json({ message: 'Unauthorized' });
        }
        
        const favoriteSectionIds = await this.courseSectionFavoriteService.getUserFavoritesByCourse(userId, courseId);
        return response.status(HttpStatus.OK).json({
            data: { sectionIds: favoriteSectionIds },
        });
    }
}

