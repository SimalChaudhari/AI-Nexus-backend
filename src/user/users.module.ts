//users.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserService } from './users.service';
import { UserController } from './users.controller';
import { AdminController } from './admin.controller';
import { UserEntity } from './users.entity';
import { JwtModule } from '@nestjs/jwt';
import { CourseModule } from '../course/courses.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([UserEntity]),
        JwtModule.register({
            secret: process.env.JWT_SECRET,
            signOptions: {},
        }),
        CourseModule,
    ],
    providers: [UserService],
    controllers: [UserController, AdminController],
    exports: [UserService],
})
export class UserModule {}

