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
} from '@nestjs/common';
import { UserRole } from '../user/users.entity';
import { Response } from 'express';
import { LabelService } from './labels.service';
import { CreateLabelDto, UpdateLabelDto } from './labels.dto';
import { JwtAuthGuard } from '../jwt/jwt-auth.guard';
import { RolesGuard } from '../jwt/roles.guard';
import { Roles } from '../jwt/roles.decorator';
import { SessionGuard } from '../jwt/session.guard';

@Controller('labels')
export class LabelController {
    private readonly baseUrl: string;

    constructor(private readonly labelService: LabelService) {
        this.baseUrl = process.env.BACKEND_URL || 'http://localhost:3000';
    }

    @Get()
    async getAllLabels(@Res() response: Response) {
        const labels = await this.labelService.getAll();
        return response.status(HttpStatus.OK).json({
            length: labels.length,
            data: labels,
        });
    }

    @Get(':id')
    async getLabelById(@Param('id') id: string, @Res() response: Response) {
        const label = await this.labelService.getById(id);
        return response.status(HttpStatus.OK).json({
            data: label,
        });
    }

    @Post()
    @UseGuards(SessionGuard, JwtAuthGuard, RolesGuard)
    @Roles(UserRole.Admin)
    async createLabel(
        @Body() createLabelDto: CreateLabelDto,
        @Res() response: Response,
    ) {
        const result = await this.labelService.create(createLabelDto);
        return response.status(HttpStatus.CREATED).json(result);
    }

    @Put('update/:id')
    @UseGuards(SessionGuard, JwtAuthGuard, RolesGuard)
    @Roles(UserRole.Admin)
    async updateLabel(
        @Param('id') id: string,
        @Body() updateLabelDto: UpdateLabelDto,
        @Res() response: Response,
    ) {
        const result = await this.labelService.update(id, updateLabelDto);
        return response.status(HttpStatus.OK).json(result);
    }

    @Delete('delete/:id')
    @UseGuards(SessionGuard, JwtAuthGuard, RolesGuard)
    @Roles(UserRole.Admin)
    async deleteLabel(@Param('id') id: string, @Res() response: Response) {
        const result = await this.labelService.delete(id);
        return response.status(HttpStatus.OK).json(result);
    }
}

