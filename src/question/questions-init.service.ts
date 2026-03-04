import { Injectable, OnModuleInit } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Injectable()
export class QuestionsInitService implements OnModuleInit {
    constructor(private dataSource: DataSource) {}

    async onModuleInit() {
        try {
            console.log('🔍 Checking questions, question_comments, question_comment_likes tables...');

            const queryRunner = this.dataSource.createQueryRunner();
            await queryRunner.connect();

            // Ensure users table exists first (questions and question_comments reference it)
            const usersExists = await queryRunner.hasTable('users');
            if (!usersExists) {
                console.log('📋 Creating users table (required by questions)...');
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
            }

            // Create questions table
            const questionsExists = await queryRunner.hasTable('questions');
            if (!questionsExists) {
                console.log('📋 Creating questions table...');
                await queryRunner.query(`
                    CREATE TABLE IF NOT EXISTS "questions" (
                        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                        "title" varchar NOT NULL,
                        "description" text NOT NULL,
                        "userId" uuid NULL,
                        "viewCount" integer NOT NULL DEFAULT 0,
                        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                        CONSTRAINT "PK_questions" PRIMARY KEY ("id"),
                        CONSTRAINT "FK_questions_user" FOREIGN KEY ("userId") 
                            REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION
                    )
                `);
                console.log('✅ Questions table created successfully');
            } else {
                console.log('✅ Questions table already exists');
                // Migration: add userId column if missing (optional, for logged-in author)
                const hasUserId = await queryRunner.query(`
                    SELECT column_name FROM information_schema.columns 
                    WHERE table_name = 'questions' AND column_name = 'userId'
                `);
                if (!hasUserId?.length) {
                    console.log('📋 Adding userId to questions table...');
                    await queryRunner.query(`
                        ALTER TABLE "questions" ADD COLUMN IF NOT EXISTS "userId" uuid NULL;
                        DO $$ BEGIN
                            IF NOT EXISTS (
                                SELECT 1 FROM pg_constraint WHERE conname = 'FK_questions_user'
                            ) THEN
                                ALTER TABLE "questions" ADD CONSTRAINT "FK_questions_user" 
                                    FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION;
                            END IF;
                        END $$;
                    `);
                    console.log('✅ userId column added to questions');
                }
            }

            // Create question_comments table
            const questionCommentsExists = await queryRunner.hasTable('question_comments');
            if (!questionCommentsExists) {
                console.log('📋 Creating question_comments table...');
                await queryRunner.query(`
                    CREATE TABLE IF NOT EXISTS "question_comments" (
                        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                        "content" text NOT NULL,
                        "questionId" uuid NOT NULL,
                        "userId" uuid NOT NULL,
                        "parentCommentId" uuid,
                        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                        CONSTRAINT "PK_question_comments" PRIMARY KEY ("id"),
                        CONSTRAINT "FK_question_comments_question" FOREIGN KEY ("questionId") 
                            REFERENCES "questions"("id") ON DELETE CASCADE ON UPDATE NO ACTION,
                        CONSTRAINT "FK_question_comments_user" FOREIGN KEY ("userId") 
                            REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION,
                        CONSTRAINT "FK_question_comments_parent" FOREIGN KEY ("parentCommentId") 
                            REFERENCES "question_comments"("id") ON DELETE CASCADE ON UPDATE NO ACTION
                    )
                `);
                console.log('✅ Question comments table created successfully');
            } else {
                console.log('✅ Question comments table already exists');
            }

            // Create question_comment_likes table
            const questionCommentLikesExists = await queryRunner.hasTable('question_comment_likes');
            if (!questionCommentLikesExists) {
                console.log('📋 Creating question_comment_likes table...');
                await queryRunner.query(`
                    CREATE TABLE IF NOT EXISTS "question_comment_likes" (
                        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                        "commentId" uuid NOT NULL,
                        "userId" uuid NOT NULL,
                        CONSTRAINT "PK_question_comment_likes" PRIMARY KEY ("id"),
                        CONSTRAINT "FK_question_comment_likes_comment" FOREIGN KEY ("commentId") 
                            REFERENCES "question_comments"("id") ON DELETE CASCADE ON UPDATE NO ACTION,
                        CONSTRAINT "FK_question_comment_likes_user" FOREIGN KEY ("userId") 
                            REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION,
                        CONSTRAINT "UQ_question_comment_likes_user_comment" UNIQUE ("userId", "commentId")
                    )
                `);
                console.log('✅ Question comment likes table created successfully');
            } else {
                console.log('✅ Question comment likes table already exists');
            }

            // Create pinned_questions table
            const pinnedQuestionsExists = await queryRunner.hasTable('pinned_questions');
            if (!pinnedQuestionsExists) {
                console.log('📋 Creating pinned_questions table...');
                await queryRunner.query(`
                    CREATE TABLE IF NOT EXISTS "pinned_questions" (
                        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                        "userId" uuid NOT NULL,
                        "questionId" uuid NOT NULL,
                        "pinnedAt" TIMESTAMP NOT NULL DEFAULT now(),
                        CONSTRAINT "PK_pinned_questions" PRIMARY KEY ("id"),
                        CONSTRAINT "FK_pinned_questions_user" FOREIGN KEY ("userId") 
                            REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION,
                        CONSTRAINT "FK_pinned_questions_question" FOREIGN KEY ("questionId") 
                            REFERENCES "questions"("id") ON DELETE CASCADE ON UPDATE NO ACTION,
                        CONSTRAINT "UQ_pinned_questions_user_question" UNIQUE ("userId", "questionId")
                    )
                `);
                console.log('✅ Pinned questions table created successfully');
            } else {
                console.log('✅ Pinned questions table already exists');
            }

            await queryRunner.release();
        } catch (error) {
            console.error('❌ Error initializing question tables:', error instanceof Error ? error.message : error);
        }
    }
}
