// src/tags/dto/query-tag.dto.ts

import { IsEnum, IsOptional } from 'class-validator';
import { TagType } from '../entities/tag.entity';

export class QueryTagDto {
  @IsEnum(TagType)
  @IsOptional()
  type?: TagType;
}
