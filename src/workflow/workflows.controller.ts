import {
    Controller,
    HttpStatus,
    Param,
    Get,
    Post,
    Delete,
    Put,
    Body,
    Res,
    UseGuards,
    UseInterceptors,
    UploadedFile,
    ParseFilePipe,
    MaxFileSizeValidator,
    FileTypeValidator,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { UserRole } from '../user/users.entity';
import { Response } from 'express';
import { WorkflowService } from './workflows.service';
import { CreateWorkflowDto, UpdateWorkflowDto } from './workflows.dto';
import { JwtAuthGuard } from '../jwt/jwt-auth.guard';
import { RolesGuard } from '../jwt/roles.guard';
import { Roles } from '../jwt/roles.decorator';
import { SessionGuard } from '../jwt/session.guard';
import { CloudinaryService } from '../service/cloudinary.service';

@Controller('workflows')
export class WorkflowController {
    constructor(
        private readonly workflowService: WorkflowService,
        private readonly cloudinaryService: CloudinaryService,
    ) {}

    @Get()
    async getAllWorkflows(@Res() response: Response) {
        const workflows = await this.workflowService.getAll();
        return response.status(HttpStatus.OK).json({
            length: workflows.length,
            data: workflows,
        });
    }

    @Get(':id')
    async getWorkflowById(@Param('id') id: string, @Res() response: Response) {
        const workflow = await this.workflowService.getById(id);
        return response.status(HttpStatus.OK).json({
            data: workflow,
        });
    }

    @Post()
    @UseGuards(SessionGuard, JwtAuthGuard, RolesGuard)
    @Roles(UserRole.Admin)
    @UseInterceptors(
        FileInterceptor('image', {
            storage: memoryStorage(),
            limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
        })
    )
    async createWorkflow(
        @Body() createWorkflowDto: CreateWorkflowDto,
        @Res() response: Response,
        @UploadedFile(
            new ParseFilePipe({
                fileIsRequired: false,
                validators: [
                    new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }), // 5MB
                    new FileTypeValidator({ fileType: /(jpg|jpeg|png|gif|webp)$/ }),
                ],
            })
        )
        file?: Express.Multer.File,
    ) {
        // Upload image to Cloudinary
        if (file) {
            const imageUrl = await this.cloudinaryService.uploadImage(file, 'workflow');
            createWorkflowDto.image = imageUrl;
        }

        const result = await this.workflowService.create(createWorkflowDto);
        return response.status(HttpStatus.CREATED).json({
            message: result.message,
            workflow: result.workflow,
        });
    }

    @Put('update/:id')
    @UseGuards(SessionGuard, JwtAuthGuard, RolesGuard)
    @Roles(UserRole.Admin)
    @UseInterceptors(
        FileInterceptor('image', {
            storage: memoryStorage(),
            limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
        })
    )
    async updateWorkflow(
        @Param('id') id: string,
        @Body() updateWorkflowDto: UpdateWorkflowDto,
        @Res() response: Response,
        @UploadedFile(
            new ParseFilePipe({
                fileIsRequired: false,
                validators: [
                    new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }), // 5MB
                    new FileTypeValidator({ fileType: /(jpg|jpeg|png|gif|webp)$/ }),
                ],
            })
        )
        file?: Express.Multer.File,
    ) {
        // Get existing workflow to delete old image if new one is uploaded
        const existingWorkflow = await this.workflowService.getById(id);

        // Upload new image to Cloudinary and delete old one if replaced
        if (file) {
            // Delete old image if it exists and is from Cloudinary
            if (existingWorkflow.image && existingWorkflow.image.startsWith('http')) {
                await this.cloudinaryService.deleteImage(existingWorkflow.image);
            }
            const imageUrl = await this.cloudinaryService.uploadImage(file, 'workflow');
            updateWorkflowDto.image = imageUrl;
        }

        const result = await this.workflowService.update(id, updateWorkflowDto);
        return response.status(HttpStatus.OK).json({
            message: result.message,
            workflow: result.workflow,
        });
    }

    @Delete('delete/:id')
    @UseGuards(SessionGuard, JwtAuthGuard, RolesGuard)
    @Roles(UserRole.Admin)
    async deleteWorkflow(@Param('id') id: string, @Res() response: Response) {
        // Get workflow before deleting to access image URL
        const workflow = await this.workflowService.getById(id);
        
        // Delete image from Cloudinary if it exists
        if (workflow.image && workflow.image.startsWith('http')) {
            try {
                await this.cloudinaryService.deleteImage(workflow.image);
            } catch (error) {
                console.error('Error deleting image from Cloudinary:', error);
            }
        }

        const result = await this.workflowService.delete(id);
        return response.status(HttpStatus.OK).json(result);
    }
}

