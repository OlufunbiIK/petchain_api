// ----- TAG CONTROLLER -----
// src/tags/tags.controller.ts

import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpStatus,
  HttpException,
} from '@nestjs/common';
import { TagsService } from './tags.service';
import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';
import { QueryTagDto } from './dto/query-tag.dto';

@Controller('tags')
export class TagsController {
  constructor(private readonly tagsService: TagsService) {}

  @Post()
  async create(@Body() createTagDto: CreateTagDto) {
    try {
      return await this.tagsService.create(createTagDto);
    } catch (error) {
      if (error.code === '23505') { // PostgreSQL unique constraint violation
        throw new HttpException('Tag with this name already exists', HttpStatus.CONFLICT);
      }
      throw new HttpException('Failed to create tag', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get()
  findAll(@Query() queryTagDto: QueryTagDto) {
    return this.tagsService.findAll(queryTagDto.type);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.tagsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTagDto: UpdateTagDto) {
    return this.tagsService.update(id, updateTagDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.tagsService.remove(id);
  }
}
