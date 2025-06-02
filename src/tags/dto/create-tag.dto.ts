// ----- TAG DTO -----
// src/tags/dto/create-tag.dto.ts

import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { TagType } from '../entities/tag.entity';

export class CreateTagDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEnum(TagType)
  @IsNotEmpty()
  type: TagType;
}
