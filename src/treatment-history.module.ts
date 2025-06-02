import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Pet } from './pet.entity';
import { TreatmentHistory } from './treatment-history.entity';
import { Vet } from './vet.entity';
import { TreatmentHistoryController } from './treatment-history.controller';
import { TreatmentHistoryService } from './treatment-history.service';

@Module({
  imports: [TypeOrmModule.forFeature([TreatmentHistory, Pet, Vet])],
  controllers: [TreatmentHistoryController],
  providers: [TreatmentHistoryService],
  exports: [TypeOrmModule, TreatmentHistoryService],
})
export class TreatmentHistoryModule {}
