import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsDate,
  IsInt,
  IsOptional,
} from 'class-validator';
import { Type } from 'class-transformer';
import { TreatmentType } from 'src/treatment-history.entity';

export class CreateTreatmentHistoryDto {
  @IsString()
  @IsNotEmpty()
  description: string;

  @IsEnum(TreatmentType)
  treatmentType: TreatmentType;

  @IsDate()
  @Type(() => Date)
  date: Date;

  @IsInt()
  vetId: number;

  @IsInt()
  petId: number;

  @IsString()
  @IsOptional()
  notes?: string;
}
