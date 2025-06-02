// src/treatments/dto/query-treatment.dto.ts

import { IsArray, IsOptional, IsString } from 'class-validator';
import { Transform } from 'class-transformer';

export class QueryTreatmentDto {
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  @Transform(({ value }) => (typeof value === 'string' ? [value] : value))
  tags?: string[];
}
