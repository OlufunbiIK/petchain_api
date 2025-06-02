// ----- TAG SERVICE -----
// src/tags/tags.service.ts

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';
import { Tag, TagType } from './entities/tag.entity';

@Injectable()
export class TagsService {
  constructor(
    @InjectRepository(Tag)
    private tagRepository: Repository<Tag>,
  ) {}

  async create(createTagDto: CreateTagDto): Promise<Tag> {
    const tag = this.tagRepository.create(createTagDto);
    return await this.tagRepository.save(tag);
  }

  async findAll(type?: TagType): Promise<Tag[]> {
    const queryBuilder = this.tagRepository.createQueryBuilder('tag');
    
    if (type) {
      queryBuilder.where('tag.type = :type', { type });
    }
    
    return await queryBuilder.getMany();
  }

  async findOne(id: string): Promise<Tag> {
    const tag = await this.tagRepository.findOne({ where: { id } });
    if (!tag) {
      throw new NotFoundException(`Tag with ID ${id} not found`);
    }
    return tag;
  }

  async findByName(name: string): Promise<Tag | null> {
    return await this.tagRepository.findOne({ where: { name } });
  }

  async update(id: string, updateTagDto: UpdateTagDto): Promise<Tag> {
    const tag = await this.findOne(id);
    const updatedTag = Object.assign(tag, updateTagDto);
    return await this.tagRepository.save(updatedTag);
  }

  async remove(id: string): Promise<void> {
    const result = await this.tagRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Tag with ID ${id} not found`);
    }
  }

  // Helper method to get or create tags by names
  async getOrCreateTags(tagNames: string[], type: TagType): Promise<Tag[]> {
    const tags: Tag[] = [];
    
    for (const name of tagNames) {
      let tag = await this.findByName(name);
      
      if (!tag) {
        tag = await this.create({ name, type });
      } else if (tag.type !== type) {
        // Optional: Handle case where tag exists but with different type
        // Could throw error or update tag type based on business requirements
      }
      
      tags.push(tag);
    }
    
    return tags;
  }
}
