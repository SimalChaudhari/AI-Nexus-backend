//communities.dto.ts
import { IsOptional, IsNotEmpty, IsString, IsEnum, IsNumber } from 'class-validator';
import { CommunityPricingType } from './communities.entity';

// For creating community
export class CreateCommunityDto {
    @IsString()
    @IsNotEmpty()
    title!: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsOptional()
    @IsString()
    smallImage?: string;

    @IsOptional()
    @IsString()
    largeImage?: string;

    @IsOptional()
    @IsEnum(CommunityPricingType)
    pricingType?: CommunityPricingType;

    @IsOptional()
    @IsNumber()
    amount?: number;

    @IsOptional()
    @IsString()
    categoryId?: string;
}

// For updating community - all fields optional
export class UpdateCommunityDto {
    @IsOptional()
    @IsString()
    title?: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsOptional()
    @IsString()
    smallImage?: string;

    @IsOptional()
    @IsString()
    largeImage?: string;

    @IsOptional()
    @IsEnum(CommunityPricingType)
    pricingType?: CommunityPricingType;

    @IsOptional()
    @IsNumber()
    amount?: number;

    @IsOptional()
    @IsString()
    categoryId?: string;
}

