import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { TutorialEntity } from './tutorials.entity';
import { UserEntity } from '../user/users.entity';
import { TutorialsService } from './tutorials.service';
import { TutorialsController } from './tutorials.controller';
import { TutorialsInitService } from './tutorials-init.service';
import { getJwtSecret } from '../auth/jwt-secret';

@Module({
  imports: [
    TypeOrmModule.forFeature([TutorialEntity, UserEntity]),
    JwtModule.register({
      secret: getJwtSecret(),
      signOptions: {},
    }),
  ],
  providers: [TutorialsService, TutorialsInitService],
  controllers: [TutorialsController],
  exports: [TutorialsService],
})
export class TutorialsModule {}
