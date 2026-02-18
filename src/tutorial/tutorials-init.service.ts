import { Injectable, OnModuleInit } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { TutorialEntity } from './tutorials.entity';

// Seed data (same style as frontend mock) - inserted when table is empty
const TUTORIAL_SEED: Partial<TutorialEntity>[] = [
  {
    slug: 'tutorial-1',
    title: 'How to share your tutorials',
    description:
      'Learn how to create and share your own tutorials with the community. This comprehensive guide covers recording, editing, and publishing your content.',
    thumbnail: 'https://img.freepik.com/premium-psd/attractive-new-youtube-thumbnail-design-template_941802-3547.jpg',
    videoUrl: 'https://www.youtube.com/watch?v=yAoLSRbwxL8',
    embedUrl: 'https://www.youtube.com/embed/yAoLSRbwxL8',
    category: 'beginner',
    source: 'youtube.com',
    language: 'English',
    duration: '12:30',
    authorName: 'AI Nexus Team',
    authorAvatarUrl: null,
    authorRole: 'n8n Team',
    likes: 5,
    commentCount: 2,
  },
  {
    slug: 'tutorial-2',
    title: 'Beginner course',
    description:
      'Start your journey with n8n basics. 9 videos covering 2 hours of training for absolute beginners.',
    thumbnail: 'https://img.freepik.com/free-psd/feel-music-concept-banner-template_23-2148653083.jpg',
    videoUrl: 'https://www.youtube.com/watch?v=D0UnqGm_miA',
    embedUrl: 'https://www.youtube.com/embed/D0UnqGm_miA',
    category: 'beginner',
    source: 'youtube.com',
    language: 'English',
    duration: '25:00',
    authorName: 'Community Member',
    authorRole: 'Community Member',
    likes: 12,
    commentCount: 4,
  },
  {
    slug: 'tutorial-3',
    title: 'Advanced Course',
    description:
      'Take your skills to the next level with advanced techniques. 8 videos, 1.5 hours of in-depth training.',
    thumbnail: 'https://img.freepik.com/premium-psd/man-suit-with-video-design-front-it_526766-980.jpg',
    videoUrl: 'https://www.youtube.com/watch?v=k_Lf2N2LJv8',
    embedUrl: 'https://www.youtube.com/embed/k_Lf2N2LJv8',
    category: 'advanced',
    source: 'youtube.com',
    language: 'Spanish',
    duration: '18:45',
    authorName: 'AI Nexus Team',
    authorRole: 'n8n Team',
    likes: 8,
    commentCount: 1,
  },
  {
    slug: 'tutorial-4',
    title: 'How to Create AI Chatbot for absolute beginner?',
    description:
      'Create your first AI chatbot from scratch. Perfect for beginners with no coding experience required.',
    thumbnail: 'https://img.freepik.com/premium-psd/attractive-new-youtube-thumbnail-design-template_941802-3547.jpg',
    videoUrl: 'https://www.youtube.com/watch?v=yAoLSRbwxL8',
    embedUrl: 'https://www.youtube.com/embed/yAoLSRbwxL8',
    category: 'ai',
    source: 'youtube.com',
    language: 'Portuguese',
    duration: '32:10',
    authorName: 'Community Member',
    authorRole: 'Community Member',
    likes: 24,
    commentCount: 7,
  },
  {
    slug: 'tutorial-5',
    title: 'Connect ANY API in 5 Minutes',
    description:
      'Connect to any REST API in minutes. Master authentication, headers, and request formatting.',
    thumbnail: 'https://img.freepik.com/free-psd/feel-music-concept-banner-template_23-2148653083.jpg',
    videoUrl: 'https://www.youtube.com/watch?v=D0UnqGm_miA',
    embedUrl: 'https://www.youtube.com/embed/D0UnqGm_miA',
    category: 'integration',
    source: 'youtube.com',
    language: 'German',
    duration: '8:20',
    authorName: 'AI Nexus Team',
    authorRole: 'n8n Team',
    likes: 15,
    commentCount: 3,
  },
];

@Injectable()
export class TutorialsInitService implements OnModuleInit {
  constructor(
    private dataSource: DataSource,
    @InjectRepository(TutorialEntity)
    private tutorialRepository: Repository<TutorialEntity>,
  ) {}

  async onModuleInit() {
    try {
      console.log('🔍 Checking tutorials table...');

      const queryRunner = this.dataSource.createQueryRunner();
      await queryRunner.connect();

      const tutorialsExists = await queryRunner.hasTable('tutorials');
      if (!tutorialsExists) {
        console.log('📋 Creating tutorials table...');
        await queryRunner.query(`
          CREATE TABLE IF NOT EXISTS "tutorials" (
            "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
            "slug" varchar NOT NULL,
            "title" varchar NOT NULL,
            "description" text NOT NULL,
            "thumbnail" varchar,
            "videoUrl" varchar,
            "embedUrl" varchar,
            "category" varchar,
            "source" varchar,
            "language" varchar,
            "duration" varchar,
            "viewCount" integer NOT NULL DEFAULT 0,
            "authorName" varchar,
            "authorAvatarUrl" varchar,
            "authorRole" varchar,
            "likes" integer NOT NULL DEFAULT 0,
            "commentCount" integer NOT NULL DEFAULT 0,
            "publishedAt" TIMESTAMP,
            "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
            "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
            CONSTRAINT "PK_tutorials" PRIMARY KEY ("id"),
            CONSTRAINT "UQ_tutorials_slug" UNIQUE ("slug")
          )
        `);
        console.log('✅ Tutorials table created successfully');
      } else {
        console.log('✅ Tutorials table already exists');
      }

      await queryRunner.release();

      // Seed data when table is empty (same style as frontend mock)
      const count = await this.tutorialRepository.count();
      if (count === 0) {
        console.log('📦 Seeding tutorials (mock-style data)...');
        const entities = TUTORIAL_SEED.map((row) => this.tutorialRepository.create(row));
        await this.tutorialRepository.save(entities);
        console.log(`✅ Seeded ${entities.length} tutorials`);
      }
    } catch (error) {
      console.error(
        '❌ Error initializing tutorials table:',
        error instanceof Error ? error.message : error,
      );
    }
  }
}
