//courses.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CourseService } from './courses.service';
import { CourseController } from './courses.controller';
import { CoursesInitService } from './courses-init.service';
import { CourseEntity } from './courses.entity';
import { CourseModuleEntity } from './course-module.entity';
import { CourseModuleSectionEntity } from './course-module-section.entity';
import { CourseModuleService } from './course-module.service';
import { CourseModuleSectionService } from './course-module-section.service';
import { CourseModuleInitService } from './course-module-init.service';
import { CourseModuleSectionInitService } from './course-module-section-init.service';
import { CourseProgressInitService } from './course-progress-init.service';
import { UserEntity } from '../user/users.entity';
import { CourseProgressEntity } from './course-progress.entity';
import { CourseProgressService } from './course-progress.service';
import { CourseFavoriteEntity } from './course-favorite.entity';
import { CourseFavoriteService } from './course-favorite.service';
import { CourseSectionFavoriteEntity } from './course-section-favorite.entity';
import { CourseSectionFavoriteService } from './course-section-favorite.service';
import { CourseEnrollmentEntity } from './course-enrollment.entity';
import { CourseEnrollmentService } from './course-enrollment.service';
import { CourseEnrollmentInitService } from './course-enrollment-init.service';
import { JwtModule } from '@nestjs/jwt';
import { CloudinaryModule } from '../service/cloudinary.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([CourseEntity, CourseModuleEntity, CourseModuleSectionEntity, CourseProgressEntity, CourseFavoriteEntity, CourseSectionFavoriteEntity, CourseEnrollmentEntity, UserEntity]),
        JwtModule.register({
            secret: process.env.JWT_SECRET,
            signOptions: {},
        }),
        CloudinaryModule,
    ],
    providers: [CourseService, CourseModuleService, CourseModuleSectionService, CourseProgressService, CourseFavoriteService, CourseSectionFavoriteService, CourseEnrollmentService, CoursesInitService, CourseModuleInitService, CourseModuleSectionInitService, CourseProgressInitService, CourseEnrollmentInitService],
    controllers: [CourseController],
    exports: [CourseService, CourseModuleService, CourseModuleSectionService, CourseProgressService, CourseFavoriteService, CourseSectionFavoriteService, CourseEnrollmentService],
})
export class CourseModule {}

