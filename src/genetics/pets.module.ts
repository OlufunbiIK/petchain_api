// pets.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Pet } from './pet.entity';
import { PetsService } from './pets.service';
import { PetsController } from './pets.controller';
import { PetsGeneticsController } from './pets-genetics.controller';
import { GeneticAnalyzerService } from './genetic-analyzer.service';

@Module({
  imports: [TypeOrmModule.forFeature([Pet])],
  providers: [PetsService, GeneticAnalyzerService],
  controllers: [PetsController, PetsGeneticsController],
  exports: [PetsService],
})
export class PetsModule {}

