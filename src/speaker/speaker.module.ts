import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { SpeakerEntity } from './speaker.entity';
import { UserEntity } from '../user/users.entity';
import { SpeakerService } from './speaker.service';
import { SpeakerController } from './speaker.controller';
import { SpeakerInitService } from './speaker-init.service';
import { CloudinaryModule } from '../service/cloudinary.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([SpeakerEntity, UserEntity]),
    CloudinaryModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: {},
    }),
  ],
  providers: [SpeakerService, SpeakerInitService],
  controllers: [SpeakerController],
  exports: [SpeakerService],
})
export class SpeakerModule {}
