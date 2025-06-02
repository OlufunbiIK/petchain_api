// ----- TREATMENT DTO UPDATES -----
// src/treatments/dto/create-treatment.dto.ts

import { IsArray, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateTreatmentDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  // Other existing fields...

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tagNames?: string[];
}
