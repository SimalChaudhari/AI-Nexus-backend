import { IsOptional, IsNotEmpty, IsString, IsInt, IsDateString, Min } from 'class-validator';

export class CreateTutorialDto {
  @IsString()
  @IsNotEmpty()
  slug!: string;

  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsString()
  @IsNotEmpty()
  description!: string;

  @IsOptional()
  @IsString()
  thumbnail?: string | null;

  @IsOptional()
  @IsString()
  videoUrl?: string | null;

  @IsOptional()
  @IsString()
  embedUrl?: string | null;

  @IsOptional()
  @IsString()
  category?: string | null;

  @IsOptional()
  @IsString()
  source?: string | null;

  @IsOptional()
  @IsString()
  language?: string | null;

  @IsOptional()
  @IsString()
  duration?: string | null;

  @IsOptional()
  @IsString()
  authorName?: string | null;

  @IsOptional()
  @IsString()
  authorAvatarUrl?: string | null;

  @IsOptional()
  @IsString()
  authorRole?: string | null;

  @IsOptional()
  @IsInt()
  @Min(0)
  likes?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  commentCount?: number;

  @IsOptional()
  @IsDateString()
  publishedAt?: string | null;
}

export class UpdateTutorialDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  slug?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  title?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  description?: string;

  @IsOptional()
  @IsString()
  thumbnail?: string | null;

  @IsOptional()
  @IsString()
  videoUrl?: string | null;

  @IsOptional()
  @IsString()
  embedUrl?: string | null;

  @IsOptional()
  @IsString()
  category?: string | null;

  @IsOptional()
  @IsString()
  source?: string | null;

  @IsOptional()
  @IsString()
  language?: string | null;

  @IsOptional()
  @IsString()
  duration?: string | null;

  @IsOptional()
  @IsString()
  authorName?: string | null;

  @IsOptional()
  @IsString()
  authorAvatarUrl?: string | null;

  @IsOptional()
  @IsString()
  authorRole?: string | null;

  @IsOptional()
  @IsInt()
  @Min(0)
  likes?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  commentCount?: number;

  @IsOptional()
  @IsDateString()
  publishedAt?: string | null;
}
