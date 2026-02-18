//courses.dto.ts
import { IsOptional, IsNotEmpty, IsString, IsEnum, IsBoolean, IsNumber, Min, IsArray, IsUUID } from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { CourseLevel } from './courses.entity';

function toLanguageIdsArray(value: unknown): string[] | undefined {
  if (Array.isArray(value)) return value.every((x) => typeof x === 'string') ? value : undefined;
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value) as unknown;
      return Array.isArray(parsed) ? parsed.filter((x): x is string => typeof x === 'string') : undefined;
    } catch {
      return value ? [value] : undefined;
    }
  }
  return undefined;
}

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
    @IsString()
    video?: string; // YouTube or other video link

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

    /** Language IDs (UUIDs) this course is available in */
    @IsOptional()
    @Transform(({ value }) => toLanguageIdsArray(value))
    @IsArray()
    @IsUUID('4', { each: true })
    languageIds?: string[];

    @IsOptional()
    @IsString()
    marketData?: string;

    /** Spiker IDs (UUIDs) - instructors for this course */
    @IsOptional()
    @Transform(({ value }) => toLanguageIdsArray(value))
    @IsArray()
    @IsUUID('4', { each: true })
    spikerIds?: string[];

    @IsOptional()
    @Transform(({ value }) => (value === '' || value === undefined || value === null ? undefined : Number(value)))
    @IsNumber()
    @Min(0)
    review?: number;
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
    @IsString()
    video?: string;

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

    @IsOptional()
    @Transform(({ value }) => toLanguageIdsArray(value))
    @IsArray()
    @IsUUID('4', { each: true })
    languageIds?: string[];

    @IsOptional()
    @IsString()
    marketData?: string;

    @IsOptional()
    @Transform(({ value }) => toLanguageIdsArray(value))
    @IsArray()
    @IsUUID('4', { each: true })
    spikerIds?: string[];

    @IsOptional()
    @Transform(({ value }) => (value === '' || value === undefined || value === null ? undefined : Number(value)))
    @IsNumber()
    @Min(0)
    review?: number;
}

