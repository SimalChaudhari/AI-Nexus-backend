//communities.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommunityService } from './communities.service';
import { CommunityController } from './communities.controller';
import { CommunityEntity } from './communities.entity';
import { CategoryEntity } from '../category/categories.entity';
import { UserEntity } from '../user/users.entity';
import { JwtModule } from '@nestjs/jwt';
import { CloudinaryModule } from '../service/cloudinary.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([CommunityEntity, CategoryEntity, UserEntity]),
        JwtModule.register({
            secret: process.env.JWT_SECRET,
            signOptions: {},
        }),
        CloudinaryModule,
    ],
    providers: [CommunityService],
    controllers: [CommunityController],
    exports: [CommunityService],
})
export class CommunityModule {}

