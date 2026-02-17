import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QuestionService } from './questions.service';
import { QuestionController } from './questions.controller';
import { QuestionsInitService } from './questions-init.service';
import { QuestionCommentsGateway } from './question-comments.gateway';
import { QuestionEntity } from './questions.entity';
import { QuestionCommentEntity } from './question-comments.entity';
import { QuestionCommentLikeEntity } from './question-comment-likes.entity';
import { PinnedQuestionEntity } from './pinned-questions.entity';
import { UserEntity } from '../user/users.entity';
import { JwtModule } from '@nestjs/jwt';
import { OptionalJwtAuthGuard } from '../jwt/optional-jwt-auth.guard';

@Module({
    imports: [
        TypeOrmModule.forFeature([QuestionEntity, QuestionCommentEntity, QuestionCommentLikeEntity, PinnedQuestionEntity, UserEntity]),
        JwtModule.register({
            secret: process.env.JWT_SECRET,
            signOptions: {},
        }),
    ],
    providers: [QuestionService, QuestionsInitService, QuestionCommentsGateway, OptionalJwtAuthGuard],
    controllers: [QuestionController],
    exports: [QuestionService],
})
export class QuestionModule {}
