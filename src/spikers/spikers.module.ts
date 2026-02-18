import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { SpikerEntity } from './spikers.entity';
import { UserEntity } from '../user/users.entity';
import { SpikerService } from './spikers.service';
import { SpikerController } from './spikers.controller';
import { SpikersInitService } from './spikers-init.service';
import { CloudinaryModule } from '../service/cloudinary.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([SpikerEntity, UserEntity]),
    CloudinaryModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: {},
    }),
  ],
  providers: [SpikerService, SpikersInitService],
  controllers: [SpikerController],
  exports: [SpikerService],
})
export class SpikerModule {}
