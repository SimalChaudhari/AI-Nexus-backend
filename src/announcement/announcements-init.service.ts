import { Injectable, OnModuleInit } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { AnnouncementEntity } from './announcements.entity';
import { CommentEntity } from './comments.entity';

@Injectable()
export class AnnouncementsInitService implements OnModuleInit {
  constructor(private dataSource: DataSource) {}

  async onModuleInit() {
    try {
      console.log('🔍 Checking announcements and comments tables...');
      
      const queryRunner = this.dataSource.createQueryRunner();
      await queryRunner.connect();

      // Check and create announcements table
      const announcementsExists = await queryRunner.hasTable('announcements');
      if (!announcementsExists) {
        console.log('📋 Creating announcements table...');
        await queryRunner.query(`
          CREATE TABLE IF NOT EXISTS "announcements" (
            "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
            "title" varchar NOT NULL,
            "description" text NOT NULL,
            "viewCount" integer NOT NULL DEFAULT 0,
            "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
            "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
            CONSTRAINT "PK_announcements" PRIMARY KEY ("id")
          )
        `);
        console.log('✅ Announcements table created successfully');
      } else {
        console.log('✅ Announcements table already exists');
      }

      // Check and create comments table
      const commentsExists = await queryRunner.hasTable('comments');
      if (!commentsExists) {
        console.log('📋 Creating comments table...');
        await queryRunner.query(`
          CREATE TABLE IF NOT EXISTS "comments" (
            "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
            "content" text NOT NULL,
            "announcementId" uuid NOT NULL,
            "userId" uuid NOT NULL,
            "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
            "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
            CONSTRAINT "PK_comments" PRIMARY KEY ("id"),
            CONSTRAINT "FK_comments_announcement" FOREIGN KEY ("announcementId") 
              REFERENCES "announcements"("id") ON DELETE CASCADE ON UPDATE NO ACTION,
            CONSTRAINT "FK_comments_user" FOREIGN KEY ("userId") 
              REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION
          )
        `);
        console.log('✅ Comments table created successfully');
      } else {
        console.log('✅ Comments table already exists');
      }

      // Check and create pinned_announcements table
      const pinnedAnnouncementsExists = await queryRunner.hasTable('pinned_announcements');
      if (!pinnedAnnouncementsExists) {
        console.log('📋 Creating pinned_announcements table...');
        await queryRunner.query(`
          CREATE TABLE IF NOT EXISTS "pinned_announcements" (
            "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
            "userId" uuid NOT NULL,
            "announcementId" uuid NOT NULL,
            "pinnedAt" TIMESTAMP NOT NULL DEFAULT now(),
            CONSTRAINT "PK_pinned_announcements" PRIMARY KEY ("id"),
            CONSTRAINT "FK_pinned_announcements_user" FOREIGN KEY ("userId") 
              REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION,
            CONSTRAINT "FK_pinned_announcements_announcement" FOREIGN KEY ("announcementId") 
              REFERENCES "announcements"("id") ON DELETE CASCADE ON UPDATE NO ACTION,
            CONSTRAINT "UQ_pinned_announcements_user_announcement" UNIQUE ("userId", "announcementId")
          )
        `);
        console.log('✅ Pinned announcements table created successfully');
      } else {
        console.log('✅ Pinned announcements table already exists');
      }

      await queryRunner.release();
    } catch (error) {
      console.error('❌ Error initializing tables:', error instanceof Error ? error.message : error);
      // Don't throw - let the app continue
    }
  }
}
