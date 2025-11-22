import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WorkflowService } from './workflows.service';
import { WorkflowController } from './workflows.controller';
import { WorkflowEntity } from './workflows.entity';
import { LabelEntity } from '../label/labels.entity';
import { TagEntity } from '../tag/tags.entity';
import { UserEntity } from '../user/users.entity';
import { JwtModule } from '@nestjs/jwt';

@Module({
    imports: [
        TypeOrmModule.forFeature([WorkflowEntity, LabelEntity, TagEntity, UserEntity]),
        JwtModule.register({
            secret: process.env.JWT_SECRET,
            signOptions: {},
        }),
    ],
    providers: [WorkflowService],
    controllers: [WorkflowController],
    exports: [WorkflowService],
})
export class WorkflowModule {}

