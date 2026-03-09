import {
  IsOptional,
  IsNotEmpty,
  IsString,
} from 'class-validator';

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
}
