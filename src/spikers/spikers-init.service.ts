import { Injectable, OnModuleInit } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Injectable()
export class SpikersInitService implements OnModuleInit {
  constructor(private dataSource: DataSource) {}

  async onModuleInit() {
    try {
      console.log('🔍 Checking spikers table...');

      const queryRunner = this.dataSource.createQueryRunner();
      await queryRunner.connect();

      const exists = await queryRunner.hasTable('spikers');
      if (!exists) {
        console.log('📋 Creating spikers table...');
        await queryRunner.query(`
          CREATE TABLE IF NOT EXISTS "spikers" (
            "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
            "name" varchar NOT NULL,
            "profileimage" varchar,
            "about" text,
            "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
            "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
            CONSTRAINT "PK_spikers" PRIMARY KEY ("id")
          )
        `);
        console.log('✅ Speakers table created successfully');
      } else {
        console.log('✅ Speakers table already exists');
        // Drop deprecated columns (totalstudent, review removed from schema)
        const hasTotalstudentColumn = await queryRunner.query(`
          SELECT column_name FROM information_schema.columns
          WHERE table_name = 'spikers' AND column_name = 'totalstudent'
        `);
        if (hasTotalstudentColumn?.length) {
          console.log('📋 Dropping deprecated totalstudent column from spikers table...');
          await queryRunner.query(`ALTER TABLE "spikers" DROP COLUMN IF EXISTS "totalstudent"`);
          console.log('✅ totalstudent column dropped');
        }
        const hasReviewColumn = await queryRunner.query(`
          SELECT column_name FROM information_schema.columns
          WHERE table_name = 'spikers' AND column_name = 'review'
        `);
        if (hasReviewColumn?.length) {
          console.log('📋 Dropping deprecated review column from spikers table...');
          await queryRunner.query(`ALTER TABLE "spikers" DROP COLUMN IF EXISTS "review"`);
          console.log('✅ review column dropped');
        }
        const hasOldCoursesColumn = await queryRunner.query(`
          SELECT column_name FROM information_schema.columns
          WHERE table_name = 'spikers' AND column_name = 'courses'
        `);
        if (hasOldCoursesColumn?.length > 0) {
          console.log('📋 Dropping old integer column "courses" from spikers...');
          await queryRunner.query(`ALTER TABLE "spikers" DROP COLUMN IF EXISTS "courses"`);
          console.log('✅ Dropped old courses column');
        }
        const hasCourseIdsColumn = await queryRunner.query(`
          SELECT column_name FROM information_schema.columns
          WHERE table_name = 'spikers' AND column_name = 'courseIds'
        `);
        if (hasCourseIdsColumn?.length > 0) {
          console.log('📋 Dropping courseIds column from spikers (spikers now selected from course)...');
          await queryRunner.query(`ALTER TABLE "spikers" DROP COLUMN IF EXISTS "courseIds"`);
          console.log('✅ courseIds column dropped');
        }
        const joinExists = await queryRunner.hasTable('spiker_courses');
        if (joinExists) {
          console.log('📋 Dropping spiker_courses join table...');
          await queryRunner.query(`DROP TABLE IF EXISTS "spiker_courses"`);
          console.log('✅ spiker_courses table dropped');
        }
      }

      await queryRunner.release();
    } catch (error) {
      console.error(
        '❌ Error initializing spikers table:',
        error instanceof Error ? error.message : error,
      );
    }
  }
}
