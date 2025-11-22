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
      url: process.env.DATABASE_URL,
      autoLoadEntities: true,
      synchronize: true,
      ssl: process.env.DATABASE_URL?.includes('localhost') ? false : {
        rejectUnauthorized: false,
      },
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
