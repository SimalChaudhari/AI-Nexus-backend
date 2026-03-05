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
import { UserEntity } from '../user/users.entity';
import { JwtModule } from '@nestjs/jwt';
import { CloudinaryModule } from '../service/cloudinary.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([CourseEntity, CourseModuleEntity, CourseModuleSectionEntity, UserEntity]),
        JwtModule.register({
            secret: process.env.JWT_SECRET,
            signOptions: {},
        }),
        CloudinaryModule,
    ],
    providers: [CourseService, CourseModuleService, CourseModuleSectionService, CoursesInitService, CourseModuleInitService, CourseModuleSectionInitService],
    controllers: [CourseController],
    exports: [CourseService, CourseModuleService, CourseModuleSectionService],
})
export class CourseModule {}

