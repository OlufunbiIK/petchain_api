import { IsOptional, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class ReviewFilterDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  minRating?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  productId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  serviceId?: number;
}
