// ----- TREATMENT SERVICE UPDATES -----
// src/treatments/treatments.service.ts

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateTreatmentDto } from './dto/create-treatment.dto';
import { UpdateTreatmentDto } from './dto/update-treatment.dto';
import { Treatment } from './entities/treatment.entity';
import { TagsService } from '../tags/tags.service';
import { TagType } from '../tags/entities/tag.entity';

@Injectable()
export class TreatmentsService {
  constructor(
    @InjectRepository(Treatment)
    private treatmentRepository: Repository<Treatment>,
    private tagsService: TagsService,
  ) {}

  async create(createTreatmentDto: CreateTreatmentDto): Promise<Treatment> {
    const { tagNames, ...treatmentData } = createTreatmentDto;
    
    const treatment = this.treatmentRepository.create(treatmentData);
    
    if (tagNames && tagNames.length > 0) {
      treatment.tags = await this.tagsService.getOrCreateTags(tagNames, TagType.TREATMENT);
    }
    
    return await this.treatmentRepository.save(treatment);
  }

  async findAll(tagNames?: string[]): Promise<Treatment[]> {
    const queryBuilder = this.treatmentRepository
      .createQueryBuilder('treatment')
      .leftJoinAndSelect('treatment.tags', 'tag');
    
    if (tagNames && tagNames.length > 0) {
      queryBuilder.where('tag.name IN (:...tagNames)', { tagNames });
    }
    
    return await queryBuilder.getMany();
  }

  async findOne(id: string): Promise<Treatment> {
    const treatment = await this.treatmentRepository.findOne({
      where: { id },
      relations: ['tags'],
    });
    
    if (!treatment) {
      throw new NotFoundException(`Treatment with ID ${id} not found`);
    }
    
    return treatment;
  }

  async update(id: string, updateTreatmentDto: UpdateTreatmentDto): Promise<Treatment> {
    const { tagNames, ...treatmentData } = updateTreatmentDto;
    
    const treatment = await this.findOne(id);
    Object.assign(treatment, treatmentData);
    
    if (tagNames) {
      treatment.tags = await this.tagsService.getOrCreateTags(tagNames, TagType.TREATMENT);
    }
    
    return await this.treatmentRepository.save(treatment);
  }

  async remove(id: string): Promise<void> {
    const result = await this.treatmentRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Treatment with ID ${id} not found`);
    }
  }
}
