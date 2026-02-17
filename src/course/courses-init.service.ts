import { Injectable, OnModuleInit } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Injectable()
export class CoursesInitService implements OnModuleInit {
  constructor(private dataSource: DataSource) {}

  async onModuleInit() {
    try {
      console.log('🔍 Checking courses table...');
      
      const queryRunner = this.dataSource.createQueryRunner();
      await queryRunner.connect();

      const coursesExists = await queryRunner.hasTable('courses');
      if (!coursesExists) {
        console.log('📋 Creating courses table...');
        await queryRunner.query(`
          CREATE TABLE IF NOT EXISTS "courses" (
            "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
            "title" varchar NOT NULL,
            "description" text,
            "image" text,
            "video" varchar(500),
            "freeOrPaid" boolean NOT NULL DEFAULT false,
            "amount" decimal(10,2) DEFAULT 0,
            "level" varchar NOT NULL DEFAULT 'Beginner',
            "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
            "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
            CONSTRAINT "PK_courses" PRIMARY KEY ("id")
          )
        `);
        console.log('✅ Courses table created successfully');
      } else {
        console.log('✅ Courses table already exists');
        // Add video column if it doesn't exist (for existing databases)
        const hasVideoColumn = await queryRunner.query(`
          SELECT column_name FROM information_schema.columns
          WHERE table_name = 'courses' AND column_name = 'video'
        `);
        if (!hasVideoColumn?.length) {
          console.log('📋 Adding video column to courses table...');
          await queryRunner.query(`ALTER TABLE "courses" ADD COLUMN "video" varchar(500)`);
          console.log('✅ Video column added successfully');
        }
      }

      await queryRunner.release();
    } catch (error) {
      console.error('❌ Error initializing courses table:', error instanceof Error ? error.message : error);
    }
  }
}
