// pets-genetics.controller.ts
import { 
    Controller, 
    Param, 
    Body, 
    Post, 
    Get,
    ParseIntPipe,
    BadRequestException,
    NotFoundException
  } from '@nestjs/common';
  import { PetsService } from './pets.service';
  import { GeneticAnalyzerService } from './genetic-analyzer.service';
  import { GeneticDataDto } from './dto/genetic-data.dto';
  import { GeneticSummaryDto } from './dto/genetic-summary.dto';
  
  @Controller('pets')
  export class PetsGeneticsController {
    constructor(
      private readonly petsService: PetsService,
      private readonly geneticAnalyzerService: GeneticAnalyzerService
    ) {}
  
    @Post(':id/genetics')
    async uploadGeneticData(
      @Param('id', ParseIntPipe) id: number,
      @Body() geneticDataDto: GeneticDataDto
    ): Promise<{ message: string }> {
      // Find the pet
      const pet = await this.petsService.findOne(id);
      if (!pet) {
        throw new NotFoundException(Pet with ID ${id} not found);
      }
  
      // Validate genetic data
      if (!this.geneticAnalyzerService.validateGeneticData(geneticDataDto.geneticData)) {
        throw new BadRequestException('Invalid genetic data format');
      }
  
      // Update pet with genetic data
      pet.geneticData = geneticDataDto.geneticData;
      await this.petsService.update(id, pet);
  
      return { message: 'Genetic data uploaded successfully' };
    }
  
    @Get(':id/genetics')
    async getGeneticData(
      @Param('id', ParseIntPipe) id: number
    ): Promise<any> {
      const pet = await this.petsService.findOne(id);
      if (!pet) {
        throw new NotFoundException(Pet with ID ${id} not found);
      }
  
      if (!pet.geneticData) {
        throw new NotFoundException(No genetic data found for pet with ID ${id});
      }
  
      return pet.geneticData;
    }
  
    @Get(':id/genetics/summary')
    async getGeneticSummary(
      @Param('id', ParseIntPipe) id: number
    ): Promise<GeneticSummaryDto> {
      const pet = await this.petsService.findOne(id);
      if (!pet) {
        throw new NotFoundException(Pet with ID ${id} not found);
      }
  
      if (!pet.geneticData) {
        throw new NotFoundException(No genetic data found for pet with ID ${id});
      }
  
      return this.geneticAnalyzerService.analyzeGeneticData(pet);
    }
  }
  