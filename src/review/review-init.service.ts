import { Injectable, OnModuleInit } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Injectable()
export class ReviewInitService implements OnModuleInit {
  constructor(private dataSource: DataSource) {}

  async onModuleInit() {
    try {
      console.log('🔍 Checking reviews table...');
      const queryRunner = this.dataSource.createQueryRunner();
      await queryRunner.connect();

      const exists = await queryRunner.hasTable('reviews');
      if (!exists) {
        console.log('📋 Creating reviews table...');
        await queryRunner.query(`
          CREATE TABLE "reviews" (
            "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
            "userId" uuid NOT NULL,
            "isSpiker" boolean NOT NULL DEFAULT false,
            "isCourse" boolean NOT NULL DEFAULT true,
            "courseId" uuid,
            "spikerId" uuid,
            "rating" decimal(3,2) NOT NULL,
            "feedback" text,
            "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
            CONSTRAINT "PK_reviews" PRIMARY KEY ("id"),
            CONSTRAINT "FK_reviews_user" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE,
            CONSTRAINT "FK_reviews_course" FOREIGN KEY ("courseId") REFERENCES "courses"("id") ON DELETE CASCADE,
            CONSTRAINT "FK_reviews_spiker" FOREIGN KEY ("spikerId") REFERENCES "spikers"("id") ON DELETE CASCADE
          )
        `);
        await queryRunner.query(`CREATE INDEX "IDX_reviews_userId" ON "reviews" ("userId")`);
        await queryRunner.query(`CREATE INDEX "IDX_reviews_courseId" ON "reviews" ("courseId")`);
        await queryRunner.query(`CREATE INDEX "IDX_reviews_spikerId" ON "reviews" ("spikerId")`);
        console.log('✅ reviews table created successfully');
      } else {
        console.log('✅ reviews table already exists');
      }

      await queryRunner.release();
    } catch (error) {
      console.error(
        '❌ Error initializing reviews table:',
        error instanceof Error ? error.message : error,
      );
    }
  }
}
