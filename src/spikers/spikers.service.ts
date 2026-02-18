import { Injectable, NotFoundException } from '@nestjs/common';
import { SpikerEntity } from './spikers.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateSpikerDto, UpdateSpikerDto } from './spikers.dto';

@Injectable()
export class SpikerService {
  constructor(
    @InjectRepository(SpikerEntity)
    private spikerRepository: Repository<SpikerEntity>,
  ) {}

  async getAll(): Promise<SpikerEntity[]> {
    return this.spikerRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async getById(id: string): Promise<SpikerEntity> {
    const spiker = await this.spikerRepository.findOne({
      where: { id },
    });
    if (!spiker) {
      throw new NotFoundException('Spiker not found');
    }
    return spiker;
  }

  async create(
    createSpikerDto: CreateSpikerDto,
  ): Promise<{ message: string; spiker: SpikerEntity }> {
    const spiker = this.spikerRepository.create({
      name: createSpikerDto.name,
      profileimage: createSpikerDto.profileimage,
      about: createSpikerDto.about,
      totalstudent: createSpikerDto.totalstudent ?? 0,
      review: createSpikerDto.review,
    });
    await this.spikerRepository.save(spiker);
    return {
      message: 'Spiker created successfully',
      spiker,
    };
  }

  async update(
    id: string,
    updateSpikerDto: UpdateSpikerDto,
  ): Promise<{ message: string; spiker: SpikerEntity }> {
    const spiker = await this.spikerRepository.findOne({
      where: { id },
    });
    if (!spiker) {
      throw new NotFoundException('Spiker not found');
    }
    if (updateSpikerDto.name !== undefined) spiker.name = updateSpikerDto.name;
    if (updateSpikerDto.profileimage !== undefined)
      spiker.profileimage = updateSpikerDto.profileimage;
    if (updateSpikerDto.about !== undefined) spiker.about = updateSpikerDto.about;
    if (updateSpikerDto.totalstudent !== undefined)
      spiker.totalstudent = updateSpikerDto.totalstudent;
    if (updateSpikerDto.review !== undefined)
      spiker.review = updateSpikerDto.review;
    await this.spikerRepository.save(spiker);
    return {
      message: 'Spiker updated successfully',
      spiker,
    };
  }

  async delete(id: string): Promise<{ message: string }> {
    const spiker = await this.spikerRepository.findOne({ where: { id } });
    if (!spiker) {
      throw new NotFoundException('Spiker not found');
    }
    await this.spikerRepository.remove(spiker);
    return { message: 'Spiker deleted successfully' };
  }
}
