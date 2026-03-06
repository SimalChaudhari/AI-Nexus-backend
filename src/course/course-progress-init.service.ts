import { Injectable, OnModuleInit } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Injectable()
export class CourseProgressInitService implements OnModuleInit {
  constructor(private dataSource: DataSource) {}

  async onModuleInit() {
    try {
      console.log('🔍 Checking course_progress table...');
      const queryRunner = this.dataSource.createQueryRunner();
      await queryRunner.connect();

      const exists = await queryRunner.hasTable('course_progress');
      if (!exists) {
        console.log('📋 Creating course_progress table...');
        await queryRunner.query(`
          CREATE TABLE "course_progress" (
            "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
            "userId" uuid NOT NULL,
            "courseId" uuid NOT NULL,
            "currentSectionId" uuid NOT NULL,
            "viewedSectionIds" jsonb NOT NULL DEFAULT '[]',
            "lastAccessedAt" TIMESTAMP NOT NULL DEFAULT now(),
            "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
            "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
            CONSTRAINT "PK_course_progress" PRIMARY KEY ("id"),
            CONSTRAINT "UQ_course_progress_user_course" UNIQUE ("userId", "courseId"),
            CONSTRAINT "FK_course_progress_user" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE,
            CONSTRAINT "FK_course_progress_course" FOREIGN KEY ("courseId") REFERENCES "courses"("id") ON DELETE CASCADE
          )
        `);
        console.log('✅ course_progress table created successfully');
      } else {
        console.log('✅ course_progress table already exists');
        const hasViewedColumn = await queryRunner.query(`
          SELECT column_name FROM information_schema.columns
          WHERE table_name = 'course_progress' AND column_name = 'viewedSectionIds'
        `);
        if (!hasViewedColumn?.length) {
          console.log('📋 Adding viewedSectionIds column to course_progress...');
          await queryRunner.query(`ALTER TABLE "course_progress" ADD COLUMN "viewedSectionIds" jsonb NOT NULL DEFAULT '[]'`);
          console.log('✅ viewedSectionIds column added');
        }
        // Backfill: set viewedSectionIds = [currentSectionId] when empty (for existing rows)
        const backfillResult = await queryRunner.query(`
          UPDATE "course_progress"
          SET "viewedSectionIds" = jsonb_build_array("currentSectionId"::text)
          WHERE ("viewedSectionIds" = '[]'::jsonb OR "viewedSectionIds" IS NULL)
            AND "currentSectionId" IS NOT NULL
          RETURNING id
        `);
        if (Array.isArray(backfillResult) && backfillResult.length > 0) {
          console.log(`✅ Backfilled viewedSectionIds for ${backfillResult.length} row(s)`);
        }
      }

      await queryRunner.release();
    } catch (error) {
      console.error(
        '❌ Error initializing course_progress table:',
        error instanceof Error ? error.message : error,
      );
    }
  }
}
