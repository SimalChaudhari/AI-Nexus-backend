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
import { SpeakerService } from './speaker.service';
import { CreateSpeakerDto, UpdateSpeakerDto } from './speaker.dto';
import { JwtAuthGuard } from '../jwt/jwt-auth.guard';
import { RolesGuard } from '../jwt/roles.guard';
import { Roles } from '../jwt/roles.decorator';
import { SessionGuard } from '../jwt/session.guard';
import { UserRole } from '../user/users.entity';
import { CloudinaryService } from '../service/cloudinary.service';

const PROFILE_IMAGE_LIMIT = 5 * 1024 * 1024; // 5MB
const PROFILE_IMAGE_TYPE = /(jpg|jpeg|png|gif|webp)$/;

@Controller('speakers')
export class SpeakerController {
  constructor(
    private readonly speakerService: SpeakerService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  @Get()
  async getAllSpeakers(@Res() response: Response) {
    const speakers = await this.speakerService.getAll();
    return response.status(HttpStatus.OK).json({
      length: speakers.length,
      data: speakers,
    });
  }

  @Get(':id')
  async getSpeakerById(@Param('id') id: string, @Res() response: Response) {
    const speaker = await this.speakerService.getById(id);
    return response.status(HttpStatus.OK).json({
      data: speaker,
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
  async createSpeaker(
    @Body() createSpeakerDto: CreateSpeakerDto,
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
      const imageUrl = await this.cloudinaryService.uploadImage(file, 'speaker');
      createSpeakerDto.profileimage = imageUrl;
    }
    const result = await this.speakerService.create(createSpeakerDto);
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
  async updateSpeaker(
    @Param('id') id: string,
    @Body() updateSpeakerDto: UpdateSpeakerDto,
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
    const existing = await this.speakerService.getById(id);
    if (file) {
      if (existing.profileimage && existing.profileimage.startsWith('http')) {
        await this.cloudinaryService.deleteImage(existing.profileimage);
      }
      const imageUrl = await this.cloudinaryService.uploadImage(file, 'speaker');
      updateSpeakerDto.profileimage = imageUrl;
    } else if (updateSpeakerDto.profileimage === '') {
      if (existing.profileimage && existing.profileimage.startsWith('http')) {
        await this.cloudinaryService.deleteImage(existing.profileimage);
      }
    }
    const result = await this.speakerService.update(id, updateSpeakerDto);
    return response.status(HttpStatus.OK).json(result);
  }

  @Delete('delete/:id')
  @UseGuards(SessionGuard, JwtAuthGuard, RolesGuard)
  @Roles(UserRole.Admin)
  async deleteSpeaker(@Param('id') id: string, @Res() response: Response) {
    const speaker = await this.speakerService.getById(id);
    if (speaker.profileimage && speaker.profileimage.startsWith('http')) {
      try {
        await this.cloudinaryService.deleteImage(speaker.profileimage);
      } catch (error) {
        console.error('Error deleting speaker image from Cloudinary:', error);
      }
    }
    const result = await this.speakerService.delete(id);
    return response.status(HttpStatus.OK).json(result);
  }
}
