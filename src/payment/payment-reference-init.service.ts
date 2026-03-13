import { Injectable, OnModuleInit } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Injectable()
export class PaymentReferenceInitService implements OnModuleInit {
  constructor(private dataSource: DataSource) {}

  async onModuleInit() {
    try {
      const queryRunner = this.dataSource.createQueryRunner();
      await queryRunner.connect();

      const exists = await queryRunner.hasTable('payment_references');
      if (!exists) {
        await queryRunner.query(`
          CREATE TABLE "payment_references" (
            "id" varchar(32) NOT NULL,
            "userId" uuid NOT NULL,
            "courseIds" text NOT NULL,
            "items" jsonb,
            "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
            CONSTRAINT "PK_payment_references" PRIMARY KEY ("id"),
            CONSTRAINT "FK_payment_references_user" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE
          )
        `);
        await queryRunner.query(`CREATE INDEX "IDX_payment_references_userId" ON "payment_references" ("userId")`);
        console.log('✅ payment_references table created successfully');
      }

      await queryRunner.release();
    } catch (error) {
      console.error(
        '❌ Error initializing payment_references table:',
        error instanceof Error ? error.message : error,
      );
    }
  }
}
