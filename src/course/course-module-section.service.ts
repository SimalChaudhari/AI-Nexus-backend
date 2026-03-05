import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CourseModuleSectionEntity } from './course-module-section.entity';
import {
  CreateCourseModuleSectionDto,
  UpdateCourseModuleSectionDto,
} from './course-module-section.dto';
import { CourseModuleService } from './course-module.service';

@Injectable()
export class CourseModuleSectionService {
  constructor(
    @InjectRepository(CourseModuleSectionEntity)
    private readonly sectionRepository: Repository<CourseModuleSectionEntity>,
    private readonly moduleService: CourseModuleService,
  ) {}

  async findByModuleId(moduleId: string): Promise<CourseModuleSectionEntity[]> {
    return this.sectionRepository.find({
      where: { moduleId },
      order: { sortOrder: 'ASC', createdAt: 'ASC' },
    });
  }

  async create(
    moduleId: string,
    dto: CreateCourseModuleSectionDto,
  ): Promise<CourseModuleSectionEntity> {
    await this.moduleService.getById(moduleId);
    const maxOrder = await this.sectionRepository
      .createQueryBuilder('s')
      .select('MAX(s.sortOrder)', 'max')
      .where('s.moduleId = :moduleId', { moduleId })
      .getRawOne();
    const nextOrder = maxOrder?.max != null ? Number(maxOrder.max) + 1 : 0;
    const sortOrder = dto.sortOrder ?? nextOrder;
    const section = this.sectionRepository.create({
      moduleId,
      title: dto.title,
      videoUrl: dto.videoUrl,
      description: dto.description,
      content: dto.content,
      sortOrder,
    });
    return this.sectionRepository.save(section);
  }

  async update(
    id: string,
    dto: UpdateCourseModuleSectionDto,
  ): Promise<CourseModuleSectionEntity> {
    const section = await this.sectionRepository.findOne({ where: { id } });
    if (!section) throw new NotFoundException('Course module section not found');
    if (dto.title !== undefined) section.title = dto.title;
    if (dto.videoUrl !== undefined) section.videoUrl = dto.videoUrl;
    if (dto.description !== undefined) section.description = dto.description;
    if (dto.content !== undefined) section.content = dto.content;
    if (dto.sortOrder !== undefined) section.sortOrder = dto.sortOrder;
    return this.sectionRepository.save(section);
  }

  async delete(id: string): Promise<{ message: string }> {
    const section = await this.sectionRepository.findOne({ where: { id } });
    if (!section) throw new NotFoundException('Course module section not found');
    await this.sectionRepository.remove(section);
    return { message: 'Section deleted successfully' };
  }
}
