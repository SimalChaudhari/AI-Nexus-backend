import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LabelService } from './labels.service';
import { LabelController } from './labels.controller';
import { LabelEntity } from './labels.entity';
import { UserEntity } from '../user/users.entity';
import { JwtModule } from '@nestjs/jwt';

@Module({
    imports: [
        TypeOrmModule.forFeature([LabelEntity, UserEntity]),
        JwtModule.register({
            secret: process.env.JWT_SECRET,
            signOptions: {},
        }),
    ],
    providers: [LabelService],
    controllers: [LabelController],
    exports: [LabelService],
})
export class LabelModule {}

