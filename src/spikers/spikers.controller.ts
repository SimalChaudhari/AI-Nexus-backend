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
import { Response } from 'express';
import { SpikerService } from './spikers.service';
import { CreateSpikerDto, UpdateSpikerDto } from './spikers.dto';
import { JwtAuthGuard } from '../jwt/jwt-auth.guard';
import { RolesGuard } from '../jwt/roles.guard';
import { Roles } from '../jwt/roles.decorator';
import { SessionGuard } from '../jwt/session.guard';
import { UserRole } from '../user/users.entity';
import { CloudinaryService } from '../service/cloudinary.service';

const PROFILE_IMAGE_LIMIT = 5 * 1024 * 1024; // 5MB
const PROFILE_IMAGE_TYPE = /(jpg|jpeg|png|gif|webp)$/;

@Controller('spikers')
export class SpikerController {
  constructor(
    private readonly spikerService: SpikerService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  @Get()
  async getAllSpikers(@Res() response: Response) {
    const spikers = await this.spikerService.getAll();
    return response.status(HttpStatus.OK).json({
      length: spikers.length,
      data: spikers,
    });
  }

  @Get(':id')
  async getSpikerById(@Param('id') id: string, @Res() response: Response) {
    const spiker = await this.spikerService.getById(id);
    return response.status(HttpStatus.OK).json({
      data: spiker,
    });
  }

  @Post()
  @UseGuards(SessionGuard, JwtAuthGuard, RolesGuard)
  @Roles(UserRole.Admin)
  @UseInterceptors(
    FileInterceptor('profileimage', {
      storage: memoryStorage(),
      limits: { fileSize: PROFILE_IMAGE_LIMIT },
    }),
  )
  async createSpiker(
    @Body() createSpikerDto: CreateSpikerDto,
    @Res() response: Response,
    @UploadedFile(
      new ParseFilePipe({
        fileIsRequired: false,
        validators: [
          new MaxFileSizeValidator({ maxSize: PROFILE_IMAGE_LIMIT }),
          new FileTypeValidator({ fileType: PROFILE_IMAGE_TYPE }),
        ],
      }),
    )
    file?: Express.Multer.File,
  ) {
    if (file) {
      const imageUrl = await this.cloudinaryService.uploadImage(file, 'spiker');
      createSpikerDto.profileimage = imageUrl;
    }
    const result = await this.spikerService.create(createSpikerDto);
    return response.status(HttpStatus.CREATED).json(result);
  }

  @Put('update/:id')
  @UseGuards(SessionGuard, JwtAuthGuard, RolesGuard)
  @Roles(UserRole.Admin)
  @UseInterceptors(
    FileInterceptor('profileimage', {
      storage: memoryStorage(),
      limits: { fileSize: PROFILE_IMAGE_LIMIT },
    }),
  )
  async updateSpiker(
    @Param('id') id: string,
    @Body() updateSpikerDto: UpdateSpikerDto,
    @Res() response: Response,
    @UploadedFile(
      new ParseFilePipe({
        fileIsRequired: false,
        validators: [
          new MaxFileSizeValidator({ maxSize: PROFILE_IMAGE_LIMIT }),
          new FileTypeValidator({ fileType: PROFILE_IMAGE_TYPE }),
        ],
      }),
    )
    file?: Express.Multer.File,
  ) {
    const existing = await this.spikerService.getById(id);
    if (file) {
      if (existing.profileimage && existing.profileimage.startsWith('http')) {
        await this.cloudinaryService.deleteImage(existing.profileimage);
      }
      const imageUrl = await this.cloudinaryService.uploadImage(file, 'spiker');
      updateSpikerDto.profileimage = imageUrl;
    } else if (updateSpikerDto.profileimage === '') {
      if (existing.profileimage && existing.profileimage.startsWith('http')) {
        await this.cloudinaryService.deleteImage(existing.profileimage);
      }
    }
    const result = await this.spikerService.update(id, updateSpikerDto);
    return response.status(HttpStatus.OK).json(result);
  }

  @Delete('delete/:id')
  @UseGuards(SessionGuard, JwtAuthGuard, RolesGuard)
  @Roles(UserRole.Admin)
  async deleteSpiker(@Param('id') id: string, @Res() response: Response) {
    const spiker = await this.spikerService.getById(id);
    if (spiker.profileimage && spiker.profileimage.startsWith('http')) {
      try {
        await this.cloudinaryService.deleteImage(spiker.profileimage);
      } catch (error) {
        console.error('Error deleting spiker image from Cloudinary:', error);
      }
    }
    const result = await this.spikerService.delete(id);
    return response.status(HttpStatus.OK).json(result);
  }
}
