import { Injectable, OnModuleInit } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Injectable()
export class UsersInitService implements OnModuleInit {
  constructor(private dataSource: DataSource) {}

  async onModuleInit() {
    try {
      console.log('🔍 Checking users table...');
      const queryRunner = this.dataSource.createQueryRunner();
      await queryRunner.connect();

      const usersExists = await queryRunner.hasTable('users');
      if (!usersExists) {
        console.log('📋 Creating users table...');
        await queryRunner.query(`
          DO $$ BEGIN
            CREATE TYPE "users_role_enum" AS ENUM('Admin', 'User');
          EXCEPTION WHEN duplicate_object THEN NULL;
          END $$;
        `);
        await queryRunner.query(`
          DO $$ BEGIN
            CREATE TYPE "users_status_enum" AS ENUM('active', 'banned');
          EXCEPTION WHEN duplicate_object THEN NULL;
          END $$;
        `);
        await queryRunner.query(`
          CREATE TABLE IF NOT EXISTS "users" (
            "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
            "username" varchar NOT NULL,
            "firstname" varchar NOT NULL,
            "lastname" varchar NOT NULL,
            "email" varchar NOT NULL,
            "password" varchar NOT NULL,
            "isVerified" boolean NOT NULL DEFAULT false,
            "role" "users_role_enum" NOT NULL DEFAULT 'User',
            "status" "users_status_enum" NOT NULL DEFAULT 'active',
            "verificationToken" varchar,
            "verificationTokenExpires" TIMESTAMP,
            "resetToken" varchar,
            "resetTokenExpires" TIMESTAMP,
            "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
            "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
            CONSTRAINT "PK_users" PRIMARY KEY ("id"),
            CONSTRAINT "UQ_users_username" UNIQUE ("username"),
            CONSTRAINT "UQ_users_email" UNIQUE ("email")
          )
        `);
        console.log('✅ Users table created successfully');
      } else {
        console.log('✅ Users table already exists');
      }

      await queryRunner.release();
    } catch (error) {
      console.error('❌ Error initializing users table:', error instanceof Error ? error.message : error);
      // Don't throw - let the app continue
    }
  }
}
