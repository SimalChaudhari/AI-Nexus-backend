import { IsOptional, IsNotEmpty, IsString } from 'class-validator';

export class CreateQuestionDto {
    @IsString()
    @IsNotEmpty()
    title!: string;

    @IsString()
    @IsNotEmpty()
    description!: string;
}

export class UpdateQuestionDto {
    @IsOptional()
    @IsString()
    @IsNotEmpty()
    title?: string;

    @IsOptional()
    @IsString()
    @IsNotEmpty()
    description?: string;
}

export class CreateQuestionCommentDto {
    @IsString()
    @IsNotEmpty()
    content!: string;

    @IsOptional()
    @IsString()
    parentCommentId?: string;
}

export class UpdateQuestionCommentDto {
    @IsString()
    @IsNotEmpty()
    content!: string;
}
