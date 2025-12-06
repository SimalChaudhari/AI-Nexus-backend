//courses.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CourseService } from './courses.service';
import { CourseController } from './courses.controller';
import { CourseEntity } from './courses.entity';
import { UserEntity } from '../user/users.entity';
import { JwtModule } from '@nestjs/jwt';
import { CloudinaryModule } from '../service/cloudinary.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([CourseEntity, UserEntity]),
        JwtModule.register({
            secret: process.env.JWT_SECRET,
            signOptions: {},
        }),
        CloudinaryModule,
    ],
    providers: [CourseService],
    controllers: [CourseController],
    exports: [CourseService],
})
export class CourseModule {}

