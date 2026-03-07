import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CourseSectionFavoriteEntity } from './course-section-favorite.entity';

@Injectable()
export class CourseSectionFavoriteService {
    constructor(
        @InjectRepository(CourseSectionFavoriteEntity)
        private favoriteRepository: Repository<CourseSectionFavoriteEntity>,
    ) {}

    async toggleFavorite(userId: string, sectionId: string): Promise<{ isFavorite: boolean }> {
        const existing = await this.favoriteRepository.findOne({
            where: { userId, sectionId },
        });

        if (existing) {
            await this.favoriteRepository.remove(existing);
            return { isFavorite: false };
        } else {
            const favorite = this.favoriteRepository.create({ userId, sectionId });
            await this.favoriteRepository.save(favorite);
            return { isFavorite: true };
        }
    }

    async isFavorite(userId: string, sectionId: string): Promise<boolean> {
        const favorite = await this.favoriteRepository.findOne({
            where: { userId, sectionId },
        });
        return !!favorite;
    }

    async getUserFavoriteSectionIds(userId: string): Promise<string[]> {
        const favorites = await this.favoriteRepository.find({
            where: { userId },
            select: ['sectionId'],
        });
        return favorites.map((f) => f.sectionId);
    }

    async getUserFavoritesByCourse(userId: string, courseId: string): Promise<string[]> {
        // Get all sections for the course and check which are favorited
        // This requires joining with course_module_sections and course_modules
        const favorites = await this.favoriteRepository
            .createQueryBuilder('favorite')
            .innerJoin('course_module_sections', 'section', 'section.id = favorite.sectionId')
            .innerJoin('course_modules', 'module', 'module.id = section.moduleId')
            .where('favorite.userId = :userId', { userId })
            .andWhere('module.courseId = :courseId', { courseId })
            .select('favorite.sectionId', 'sectionId')
            .getRawMany();
        
        return favorites.map((f) => f.sectionId);
    }
}
