import { Injectable, OnModuleInit } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Injectable()
export class WorkflowsInitService implements OnModuleInit {
  constructor(private dataSource: DataSource) {}

  async onModuleInit() {
    try {
      console.log('🔍 Checking workflows table...');
      
      const queryRunner = this.dataSource.createQueryRunner();
      await queryRunner.connect();

      const workflowsExists = await queryRunner.hasTable('workflows');
      if (!workflowsExists) {
        console.log('📋 Creating workflows table...');
        await queryRunner.query(`
          CREATE TABLE IF NOT EXISTS "workflows" (
            "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
            "title" varchar NOT NULL,
            "description" text,
            "image" text,
            "labelId" uuid,
            "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
            "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
            CONSTRAINT "PK_workflows" PRIMARY KEY ("id"),
            CONSTRAINT "FK_workflows_label" FOREIGN KEY ("labelId") 
              REFERENCES "labels"("id") ON DELETE SET NULL ON UPDATE NO ACTION
          )
        `);
        console.log('✅ Workflows table created successfully');
      } else {
        console.log('✅ Workflows table already exists');
      }

      // Check and create workflow_tags join table (ManyToMany relationship)
      const workflowTagsExists = await queryRunner.hasTable('workflow_tags');
      if (!workflowTagsExists) {
        console.log('📋 Creating workflow_tags join table...');
        await queryRunner.query(`
          CREATE TABLE IF NOT EXISTS "workflow_tags" (
            "workflowId" uuid NOT NULL,
            "tagId" uuid NOT NULL,
            CONSTRAINT "PK_workflow_tags" PRIMARY KEY ("workflowId", "tagId"),
            CONSTRAINT "FK_workflow_tags_workflow" FOREIGN KEY ("workflowId") 
              REFERENCES "workflows"("id") ON DELETE CASCADE ON UPDATE NO ACTION,
            CONSTRAINT "FK_workflow_tags_tag" FOREIGN KEY ("tagId") 
              REFERENCES "tags"("id") ON DELETE CASCADE ON UPDATE NO ACTION
          )
        `);
        console.log('✅ Workflow_tags join table created successfully');
      } else {
        console.log('✅ Workflow_tags join table already exists');
      }

      await queryRunner.release();
    } catch (error) {
      console.error('❌ Error initializing workflows table:', error instanceof Error ? error.message : error);
    }
  }
}
