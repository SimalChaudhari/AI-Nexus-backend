//communities.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { CommunityEntity, CommunityPricingType } from './communities.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateCommunityDto, UpdateCommunityDto } from './communities.dto';
import { CategoryEntity } from '../category/categories.entity';
import { unlink } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

@Injectable()
export class CommunityService {
    constructor(
        @InjectRepository(CommunityEntity)
        private communityRepository: Repository<CommunityEntity>,
        @InjectRepository(CategoryEntity)
        private categoryRepository: Repository<CategoryEntity>,
    ) { }

    async getAll(): Promise<CommunityEntity[]> {
        return await this.communityRepository.find({
            relations: ['category'],
            order: { createdAt: 'DESC' }
        });
    }

    async getById(id: string): Promise<CommunityEntity> {
        const community = await this.communityRepository.findOne({
            where: { id },
            relations: ['category']
        });
        if (!community) {
            throw new NotFoundException("Community not found");
        }
        return community;
    }

    async create(createCommunityDto: CreateCommunityDto): Promise<{ message: string; community: CommunityEntity }> {
        const communityData: Partial<CommunityEntity> = {
            title: createCommunityDto.title,
            description: createCommunityDto.description || undefined,
            smallImage: createCommunityDto.smallImage || undefined,
            largeImage: createCommunityDto.largeImage || undefined,
            pricingType: createCommunityDto.pricingType || CommunityPricingType.Free,
            amount: createCommunityDto.amount || 0,
        };

        const community = this.communityRepository.create(communityData);

        // Handle category relationship if categoryId provided
        if (createCommunityDto.categoryId) {
            const category = await this.categoryRepository.findOne({
                where: { id: createCommunityDto.categoryId }
            });
            if (category) {
                community.category = category;
                community.categoryId = category.id;
            }
        }

        await this.communityRepository.save(community);
        const savedCommunity = await this.getById(community.id);
        return {
            message: 'Community created successfully',
            community: savedCommunity,
        };
    }

    async update(id: string, updateCommunityDto: UpdateCommunityDto): Promise<{ message: string; community: CommunityEntity }> {
        const community = await this.communityRepository.findOne({
            where: { id },
            relations: ['category']
        });
        if (!community) {
            throw new NotFoundException('Community not found');
        }

        // Delete old files if new ones are being uploaded
        if (updateCommunityDto.smallImage !== undefined && updateCommunityDto.smallImage && community.smallImage) {
            const oldFilePath = join(process.cwd(), community.smallImage);
            if (existsSync(oldFilePath)) {
                try {
                    await unlink(oldFilePath);
                } catch (error) {
                    console.error('Error deleting old small image:', error);
                }
            }
        }
        if (updateCommunityDto.largeImage !== undefined && updateCommunityDto.largeImage && community.largeImage) {
            const oldFilePath = join(process.cwd(), community.largeImage);
            if (existsSync(oldFilePath)) {
                try {
                    await unlink(oldFilePath);
                } catch (error) {
                    console.error('Error deleting old large image:', error);
                }
            }
        }

        // Update fields if provided
        if (updateCommunityDto.title !== undefined) {
            community.title = updateCommunityDto.title;
        }
        if (updateCommunityDto.description !== undefined) {
            community.description = updateCommunityDto.description;
        }
        if (updateCommunityDto.smallImage !== undefined) {
            community.smallImage = updateCommunityDto.smallImage;
        }
        if (updateCommunityDto.largeImage !== undefined) {
            community.largeImage = updateCommunityDto.largeImage;
        }
        if (updateCommunityDto.pricingType !== undefined) {
            community.pricingType = updateCommunityDto.pricingType;
        }
        if (updateCommunityDto.amount !== undefined) {
            community.amount = updateCommunityDto.amount;
        }

        // Update category relationship if categoryId provided
        if (updateCommunityDto.categoryId !== undefined) {
            if (updateCommunityDto.categoryId) {
                const category = await this.categoryRepository.findOne({
                    where: { id: updateCommunityDto.categoryId }
                });
                if (category) {
                    community.category = category;
                    community.categoryId = category.id;
                }
            } else {
                // Remove category if categoryId is empty string or null
                community.category = undefined;
                community.categoryId = undefined;
            }
        }

        await this.communityRepository.save(community);
        const updatedCommunity = await this.getById(id);
        return {
            message: 'Community updated successfully',
            community: updatedCommunity,
        };
    }

    async delete(id: string): Promise<{ message: string }> {
        const community = await this.communityRepository.findOne({ where: { id } });
        if (!community) {
            throw new NotFoundException('Community not found');
        }

        // Delete associated image files
        if (community.smallImage) {
            const smallImagePath = join(process.cwd(), community.smallImage);
            if (existsSync(smallImagePath)) {
                try {
                    await unlink(smallImagePath);
                } catch (error) {
                    console.error('Error deleting small image:', error);
                }
            }
        }
        if (community.largeImage) {
            const largeImagePath = join(process.cwd(), community.largeImage);
            if (existsSync(largeImagePath)) {
                try {
                    await unlink(largeImagePath);
                } catch (error) {
                    console.error('Error deleting large image:', error);
                }
            }
        }

        await this.communityRepository.remove(community);
        return { message: 'Community deleted successfully' };
    }
}

