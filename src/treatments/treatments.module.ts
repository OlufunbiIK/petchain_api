// ----- TREATMENT MODULE UPDATES -----
// src/treatments/treatments.module.ts

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TreatmentsService } from './treatments.service';
import { TreatmentsController } from './treatments.controller';
import { Treatment } from './entities/treatment.entity';
import { TagsModule } from '../tags/tags.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Treatment]),
    TagsModule,
  ],
  controllers: [TreatmentsController],
  providers: [TreatmentsService],
})
export class TreatmentsModule {}

// ----- SIMILAR UPDATES FOR VACCINATION MODULE -----
// (Following the same pattern as treatments)
