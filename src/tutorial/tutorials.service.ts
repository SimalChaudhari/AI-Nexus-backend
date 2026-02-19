import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TutorialEntity } from './tutorials.entity';
import { CreateTutorialDto, UpdateTutorialDto } from './tutorials.dto';

@Injectable()
export class TutorialsService {
  constructor(
    @InjectRepository(TutorialEntity)
    private readonly tutorialRepository: Repository<TutorialEntity>,
  ) {}

  async getAll(): Promise<TutorialEntity[]> {
    return this.tutorialRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async getById(idOrSlug: string): Promise<TutorialEntity> {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idOrSlug);
    const tutorial = await this.tutorialRepository.findOne({
      where: isUuid ? { id: idOrSlug } : { slug: idOrSlug },
    });
    if (!tutorial) {
      throw new NotFoundException('Tutorial not found');
    }
    return tutorial;
  }

  async incrementViewCount(idOrSlug: string): Promise<TutorialEntity> {
    const tutorial = await this.getById(idOrSlug);
    tutorial.viewCount = (tutorial.viewCount ?? 0) + 1;
    return this.tutorialRepository.save(tutorial);
  }

  async create(dto: CreateTutorialDto): Promise<{ message: string; data: TutorialEntity }> {
    const entity = this.tutorialRepository.create({
      slug: dto.slug,
      title: dto.title,
      description: dto.description,
      thumbnail: dto.thumbnail ?? null,
      videoUrl: dto.videoUrl ?? null,
      embedUrl: dto.embedUrl ?? null,
      category: dto.category ?? null,
      source: dto.source ?? null,
      language: dto.language ?? null,
      duration: dto.duration ?? null,
      authorName: dto.authorName ?? null,
      authorAvatarUrl: dto.authorAvatarUrl ?? null,
      authorRole: dto.authorRole ?? null,
      likes: dto.likes ?? 0,
      commentCount: dto.commentCount ?? 0,
      publishedAt: dto.publishedAt ? new Date(dto.publishedAt) : null,
    });
    const saved = await this.tutorialRepository.save(entity);
    return { message: 'Tutorial created', data: saved };
  }

  async update(id: string, dto: UpdateTutorialDto): Promise<{ message: string; data: TutorialEntity }> {
    const tutorial = await this.tutorialRepository.findOne({ where: { id } });
    if (!tutorial) {
      throw new NotFoundException('Tutorial not found');
    }
    if (dto.slug !== undefined) tutorial.slug = dto.slug;
    if (dto.title !== undefined) tutorial.title = dto.title;
    if (dto.description !== undefined) tutorial.description = dto.description;
    if (dto.thumbnail !== undefined) tutorial.thumbnail = dto.thumbnail;
    if (dto.videoUrl !== undefined) tutorial.videoUrl = dto.videoUrl;
    if (dto.embedUrl !== undefined) tutorial.embedUrl = dto.embedUrl;
    if (dto.category !== undefined) tutorial.category = dto.category;
    if (dto.source !== undefined) tutorial.source = dto.source;
    if (dto.language !== undefined) tutorial.language = dto.language;
    if (dto.duration !== undefined) tutorial.duration = dto.duration;
    if (dto.authorName !== undefined) tutorial.authorName = dto.authorName;
    if (dto.authorAvatarUrl !== undefined) tutorial.authorAvatarUrl = dto.authorAvatarUrl;
    if (dto.authorRole !== undefined) tutorial.authorRole = dto.authorRole;
    if (dto.likes !== undefined) tutorial.likes = dto.likes;
    if (dto.commentCount !== undefined) tutorial.commentCount = dto.commentCount;
    if (dto.publishedAt !== undefined) tutorial.publishedAt = dto.publishedAt ? new Date(dto.publishedAt) : null;
    const saved = await this.tutorialRepository.save(tutorial);
    return { message: 'Tutorial updated', data: saved };
  }

  async delete(id: string): Promise<{ message: string }> {
    const tutorial = await this.tutorialRepository.findOne({ where: { id } });
    if (!tutorial) {
      throw new NotFoundException('Tutorial not found');
    }
    await this.tutorialRepository.remove(tutorial);
    return { message: 'Tutorial deleted' };
  }
}
