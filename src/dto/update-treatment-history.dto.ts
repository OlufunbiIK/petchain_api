import { PartialType } from '@nestjs/mapped-types';
import { CreateTreatmentHistoryDto } from './create-treatment-history.dto';

export class UpdateTreatmentHistoryDto extends PartialType(
  CreateTreatmentHistoryDto,
) {}
