//courses.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CourseService } from './courses.service';
import { CourseController } from './courses.controller';
import { CoursesInitService } from './courses-init.service';
import { CourseEntity } from './courses.entity';
import { UserEntity } from '../user/users.entity';
import { JwtModule } from '@nestjs/jwt';
import { CloudinaryModule } from '../service/cloudinary.module';
import { getJwtSecret } from '../auth/jwt-secret';

@Module({
    imports: [
        TypeOrmModule.forFeature([CourseEntity, UserEntity]),
        JwtModule.register({
            secret: getJwtSecret(),
            signOptions: {},
        }),
        CloudinaryModule,
    ],
    providers: [CourseService, CoursesInitService],
    controllers: [CourseController],
    exports: [CourseService],
})
export class CourseModule {}

