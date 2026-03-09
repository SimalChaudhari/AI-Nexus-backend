import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CourseProgressEntity } from './course-progress.entity';
import { UpdateCourseProgressDto } from './course-progress.dto';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function isValidUUID(str: string): boolean {
  return typeof str === 'string' && UUID_REGEX.test(str);
}

@Injectable()
export class CourseProgressService {
  constructor(
    @InjectRepository(CourseProgressEntity)
    private readonly progressRepository: Repository<CourseProgressEntity>,
  ) {}

  async getProgress(userId: string, courseId: string): Promise<CourseProgressEntity | null> {
    return this.progressRepository.findOne({
      where: { userId, courseId },
    });
  }

  /** Get all course progress entries for a user (for admin view). */
  async getAllProgressByUserId(userId: string): Promise<CourseProgressEntity[]> {
    return this.progressRepository.find({
      where: { userId },
      order: { lastAccessedAt: 'DESC' },
    });
  }

  async upsertProgress(
    userId: string,
    courseId: string,
    dto: UpdateCourseProgressDto,
  ): Promise<CourseProgressEntity> {
    if (!isValidUUID(dto.currentSectionId)) {
      const existing = await this.progressRepository.findOne({
        where: { userId, courseId },
      });
      if (existing) return existing;
      throw new BadRequestException('Invalid section id; progress is only saved for course sections from the curriculum.');
    }
    const existing = await this.progressRepository.findOne({
      where: { userId, courseId },
    });
    const now = new Date();
    const viewedIds = Array.isArray(existing?.viewedSectionIds) ? [...existing.viewedSectionIds] : [];
    if (isValidUUID(dto.currentSectionId) && !viewedIds.includes(dto.currentSectionId)) {
      viewedIds.push(dto.currentSectionId);
    }
    if (existing) {
      existing.currentSectionId = dto.currentSectionId;
      existing.lastAccessedAt = now;
      existing.viewedSectionIds = viewedIds;
      await this.progressRepository.save(existing);
      return existing;
    }
    const progress = this.progressRepository.create({
      userId,
      courseId,
      currentSectionId: dto.currentSectionId,
      lastAccessedAt: now,
      viewedSectionIds: viewedIds,
    });
    await this.progressRepository.save(progress);
    return progress;
  }
}
