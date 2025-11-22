//courses.dto.ts
import { IsOptional, IsNotEmpty, IsString, IsEnum, IsBoolean, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { CourseLevel } from './courses.entity';

// For creating course - title required, other fields optional
// Note: image is handled separately via file upload, not in DTO
export class CreateCourseDto {
    @IsString()
    @IsNotEmpty()
    title!: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsOptional()
    @IsString()
    image?: string; // File path (converted from file in controller)

    @IsOptional()
    @IsBoolean()
    freeOrPaid?: boolean;

    @IsOptional()
    @IsNumber()
    @Type(() => Number)
    @Min(0)
    amount?: number;

    @IsOptional()
    @IsEnum(CourseLevel)
    level?: CourseLevel;
}

// For updating course - all fields optional
export class UpdateCourseDto {
    @IsOptional()
    @IsString()
    title?: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsOptional()
    @IsString()
    image?: string;

    @IsOptional()
    @IsBoolean()
    freeOrPaid?: boolean;

    @IsOptional()
    @IsNumber()
    @Type(() => Number)
    @Min(0)
    amount?: number;

    @IsOptional()
    @IsEnum(CourseLevel)
    level?: CourseLevel;
}

