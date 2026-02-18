import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Res,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { Response } from 'express';
import { TutorialsService } from './tutorials.service';
import { CreateTutorialDto, UpdateTutorialDto } from './tutorials.dto';
import { JwtAuthGuard } from '../jwt/jwt-auth.guard';
import { RolesGuard } from '../jwt/roles.guard';
import { Roles } from '../jwt/roles.decorator';
import { SessionGuard } from '../jwt/session.guard';
import { UserRole } from '../user/users.entity';

@Controller('tutorials')
export class TutorialsController {
  constructor(private readonly tutorialsService: TutorialsService) {}

  @Get()
  async getAll(@Res() res: Response) {
    const tutorials = await this.tutorialsService.getAll();
    return res.status(HttpStatus.OK).json({
      length: tutorials.length,
      data: tutorials,
    });
  }

  @Get(':idOrSlug')
  async getById(@Param('idOrSlug') idOrSlug: string, @Res() res: Response) {
    const tutorial = await this.tutorialsService.getById(idOrSlug);
    return res.status(HttpStatus.OK).json({
      data: tutorial,
    });
  }

  @Post(':idOrSlug/view')
  async incrementView(@Param('idOrSlug') idOrSlug: string, @Res() res: Response) {
    const tutorial = await this.tutorialsService.incrementViewCount(idOrSlug);
    return res.status(HttpStatus.OK).json({
      message: 'View count incremented',
      data: tutorial,
    });
  }

  @Post()
  @UseGuards(SessionGuard, JwtAuthGuard, RolesGuard)
  @Roles(UserRole.Admin)
  async create(@Body() dto: CreateTutorialDto, @Res() res: Response) {
    const result = await this.tutorialsService.create(dto);
    return res.status(HttpStatus.CREATED).json(result);
  }

  @Put('update/:id')
  @UseGuards(SessionGuard, JwtAuthGuard, RolesGuard)
  @Roles(UserRole.Admin)
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateTutorialDto,
    @Res() res: Response,
  ) {
    const result = await this.tutorialsService.update(id, dto);
    return res.status(HttpStatus.OK).json(result);
  }

  @Delete('delete/:id')
  @UseGuards(SessionGuard, JwtAuthGuard, RolesGuard)
  @Roles(UserRole.Admin)
  async delete(@Param('id') id: string, @Res() res: Response) {
    const result = await this.tutorialsService.delete(id);
    return res.status(HttpStatus.OK).json(result);
  }
}
