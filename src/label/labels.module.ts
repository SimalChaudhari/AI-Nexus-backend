import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LabelService } from './labels.service';
import { LabelController } from './labels.controller';
import { LabelsInitService } from './labels-init.service';
import { LabelEntity } from './labels.entity';
import { UserEntity } from '../user/users.entity';
import { JwtModule } from '@nestjs/jwt';
import { getJwtSecret } from '../auth/jwt-secret';

@Module({
    imports: [
        TypeOrmModule.forFeature([LabelEntity, UserEntity]),
        JwtModule.register({
            secret: getJwtSecret(),
            signOptions: {},
        }),
    ],
    providers: [LabelService, LabelsInitService],
    controllers: [LabelController],
    exports: [LabelService],
})
export class LabelModule {}

