import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { TutorialEntity } from './tutorials.entity';
import { TutorialsService } from './tutorials.service';
import { TutorialsController } from './tutorials.controller';
import { TutorialsInitService } from './tutorials-init.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([TutorialEntity]),
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: {},
    }),
  ],
  providers: [TutorialsService, TutorialsInitService],
  controllers: [TutorialsController],
  exports: [TutorialsService],
})
export class TutorialsModule {}
