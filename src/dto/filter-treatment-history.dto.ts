import {
  IsEnum,
  IsOptional,
  IsDate,
  IsInt,
  Min,
  IsString,
} from 'class-validator';
import { Type } from 'class-transformer';
import { TreatmentType } from 'src/treatment-history.entity';

export class FilterTreatmentHistoryDto {
  @IsOptional()
  @IsEnum(TreatmentType, { each: true })
  treatmentType?: TreatmentType[];

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  startDate?: Date;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  endDate?: Date;

  @IsOptional()
  @IsInt()
  petId?: number;

  @IsOptional()
  @IsInt()
  vetId?: number;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  page?: number = 1;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  limit?: number = 10;
}
