// src/app.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/users.module';
import { CategoryModule } from './category/categories.module';
import { CommunityModule } from './community/communities.module';
import { CourseModule } from './course/courses.module';
import { LabelModule } from './label/labels.module';
import { TagModule } from './tag/tags.module';
import { WorkflowModule } from './workflow/workflows.module';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }), // Load environment variables
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: (() => {
        const dbUrl = process.env.DATABASE_URL || '';
        // Remove sslmode parameter from connection string - we'll handle SSL via TypeORM config
        // This prevents TypeORM from auto-enabling SSL based on connection string
        let cleanUrl = dbUrl.replace(/[?&]sslmode=[^&]*/g, '');
        // Clean up trailing ? or & if they exist
        cleanUrl = cleanUrl.replace(/[?&]$/, '');
        return cleanUrl;
      })(),
      autoLoadEntities: true,
      synchronize: process.env.NODE_ENV !== 'production', // Disable in production for safety
      ssl: (() => {
        const dbUrl = process.env.DATABASE_URL || '';
        // Local development - disable SSL for localhost
        if (dbUrl.includes('localhost') || dbUrl.includes('127.0.0.1')) {
          return false;
        }
        // Production/Live database - enable SSL with self-signed certificate support
        // This allows connection to Supabase and other cloud databases
        return {
          rejectUnauthorized: false,
        };
      })(),
    }),
    AuthModule,
    UserModule,
    CategoryModule,
    CommunityModule,
    CourseModule,
    LabelModule,
    TagModule,
    WorkflowModule,
  ],
  controllers: [AppController],
})
export class AppModule { }
