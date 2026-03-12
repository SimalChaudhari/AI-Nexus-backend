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
      throw new NotFoundException('Speaker not found');
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
    });
    await this.spikerRepository.save(spiker);
    return {
      message: 'Speaker created successfully',
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
      throw new NotFoundException('Speaker not found');
    }
    if (updateSpikerDto.name !== undefined) spiker.name = updateSpikerDto.name;
    if (updateSpikerDto.profileimage !== undefined)
      spiker.profileimage = updateSpikerDto.profileimage;
    if (updateSpikerDto.about !== undefined) spiker.about = updateSpikerDto.about;
    await this.spikerRepository.save(spiker);
    return {
      message: 'Speaker updated successfully',
      spiker,
    };
  }

  async delete(id: string): Promise<{ message: string }> {
    const spiker = await this.spikerRepository.findOne({ where: { id } });
    if (!spiker) {
      throw new NotFoundException('Speaker not found');
    }
    await this.spikerRepository.remove(spiker);
    return { message: 'Speaker deleted successfully' };
  }
}
