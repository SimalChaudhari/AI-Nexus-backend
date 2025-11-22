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
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { UserRole } from '../user/users.entity';
import { Response } from 'express';
import { WorkflowService } from './workflows.service';
import { CreateWorkflowDto, UpdateWorkflowDto } from './workflows.dto';
import { JwtAuthGuard } from '../jwt/jwt-auth.guard';
import { RolesGuard } from '../jwt/roles.guard';
import { Roles } from '../jwt/roles.decorator';
import { SessionGuard } from '../jwt/session.guard';

@Controller('workflows')
export class WorkflowController {
    private readonly baseUrl: string;

    constructor(private readonly workflowService: WorkflowService) {
        // Ensure directory exists
        const workflowImageDir = join(process.cwd(), 'assets', 'workflow');
        
        if (!existsSync(workflowImageDir)) {
            mkdirSync(workflowImageDir, { recursive: true });
        }

        // Get base URL from environment variable
        this.baseUrl = process.env.BACKEND_URL || 'http://localhost:3000';
    }

    /**
     * Transform image path to full URL
     */
    private transformImageUrl(imagePath?: string): string | undefined {
        if (!imagePath) return undefined;
        // If already a full URL, return as is
        if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
            return imagePath;
        }
        // If it's a base64 data URL, return as is
        if (imagePath.startsWith('data:')) {
            return imagePath;
        }
        // Otherwise, prepend base URL
        return `${this.baseUrl}${imagePath}`;
    }

    @Get()
    async getAllWorkflows(@Res() response: Response) {
        const workflows = await this.workflowService.getAll();
        // Transform image paths to full URLs
        const workflowsWithUrls = workflows.map(workflow => ({
            ...workflow,
            image: this.transformImageUrl(workflow.image),
        }));
        return response.status(HttpStatus.OK).json({
            length: workflowsWithUrls.length,
            data: workflowsWithUrls,
        });
    }

    @Get(':id')
    async getWorkflowById(@Param('id') id: string, @Res() response: Response) {
        const workflow = await this.workflowService.getById(id);
        // Transform image path to full URL
        const workflowWithUrl = {
            ...workflow,
            image: this.transformImageUrl(workflow.image),
        };
        return response.status(HttpStatus.OK).json({
            data: workflowWithUrl,
        });
    }

    @Post()
    @UseGuards(SessionGuard, JwtAuthGuard, RolesGuard)
    @Roles(UserRole.Admin)
    @UseInterceptors(
        FileInterceptor('image', {
            storage: diskStorage({
                destination: (req, file, cb) => {
                    const uploadPath = join(process.cwd(), 'assets', 'workflow');
                    
                    if (!existsSync(uploadPath)) {
                        mkdirSync(uploadPath, { recursive: true });
                    }
                    cb(null, uploadPath);
                },
                filename: (req, file, cb) => {
                    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
                    const ext = extname(file.originalname);
                    cb(null, `workflow-${uniqueSuffix}${ext}`);
                },
            }),
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
        // Store file path instead of base64
        if (file) {
            createWorkflowDto.image = `/assets/workflow/${file.filename}`;
        }

        const result = await this.workflowService.create(createWorkflowDto);
        // Transform image path to full URL
        const workflowWithUrl = {
            ...result.workflow,
            image: this.transformImageUrl(result.workflow.image),
        };
        return response.status(HttpStatus.CREATED).json({
            message: result.message,
            workflow: workflowWithUrl,
        });
    }

    @Put('update/:id')
    @UseGuards(SessionGuard, JwtAuthGuard, RolesGuard)
    @Roles(UserRole.Admin)
    @UseInterceptors(
        FileInterceptor('image', {
            storage: diskStorage({
                destination: (req, file, cb) => {
                    const uploadPath = join(process.cwd(), 'assets', 'workflow');
                    
                    if (!existsSync(uploadPath)) {
                        mkdirSync(uploadPath, { recursive: true });
                    }
                    cb(null, uploadPath);
                },
                filename: (req, file, cb) => {
                    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
                    const ext = extname(file.originalname);
                    cb(null, `workflow-${uniqueSuffix}${ext}`);
                },
            }),
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
        // Store file path instead of base64
        if (file) {
            updateWorkflowDto.image = `/assets/workflow/${file.filename}`;
        }

        const result = await this.workflowService.update(id, updateWorkflowDto);
        // Transform image path to full URL
        const workflowWithUrl = {
            ...result.workflow,
            image: this.transformImageUrl(result.workflow.image),
        };
        return response.status(HttpStatus.OK).json({
            message: result.message,
            workflow: workflowWithUrl,
        });
    }

    @Delete('delete/:id')
    @UseGuards(SessionGuard, JwtAuthGuard, RolesGuard)
    @Roles(UserRole.Admin)
    async deleteWorkflow(@Param('id') id: string, @Res() response: Response) {
        const result = await this.workflowService.delete(id);
        return response.status(HttpStatus.OK).json(result);
    }
}

