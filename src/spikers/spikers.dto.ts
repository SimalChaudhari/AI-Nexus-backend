import {
  IsOptional,
  IsNotEmpty,
  IsString,
  IsNumber,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateSpikerDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsOptional()
  @IsString()
  profileimage?: string;

  @IsOptional()
  @IsString()
  about?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  totalstudent?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(5)
  @Type(() => Number)
  review?: number;
}

export class UpdateSpikerDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  profileimage?: string;

  @IsOptional()
  @IsString()
  about?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  totalstudent?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(5)
  @Type(() => Number)
  review?: number;
}
