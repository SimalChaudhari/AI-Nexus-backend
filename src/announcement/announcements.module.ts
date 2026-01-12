import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AnnouncementService } from './announcements.service';
import { AnnouncementController } from './announcements.controller';
import { AnnouncementsInitService } from './announcements-init.service';
import { AnnouncementEntity } from './announcements.entity';
import { CommentEntity } from './comments.entity';
import { PinnedAnnouncementEntity } from './pinned-announcements.entity';
import { UserEntity } from '../user/users.entity';
import { JwtModule } from '@nestjs/jwt';
import { OptionalJwtAuthGuard } from '../jwt/optional-jwt-auth.guard';

@Module({
    imports: [
        TypeOrmModule.forFeature([AnnouncementEntity, CommentEntity, PinnedAnnouncementEntity, UserEntity]),
        JwtModule.register({
            secret: process.env.JWT_SECRET,
            signOptions: {},
        }),
    ],
    providers: [AnnouncementService, AnnouncementsInitService, OptionalJwtAuthGuard],
    controllers: [AnnouncementController],
    exports: [AnnouncementService],
})
export class AnnouncementModule {}
