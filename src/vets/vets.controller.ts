import { Controller, Get, Post, Body, Param, Put, Delete, Query } from '@nestjs/common';
import { VetsService } from './vets.service';
import { Vet } from './entities/vet.entity';
import { CreateVetDto } from './dto/create-vet.dto';
import { NearbyVetDto } from './dto/nearby-vet.dto';
import { CoordinatesDto } from '../common/dto/coordinates.dto';

@Controller('vets')
export class VetsController {
  constructor(private readonly vetsService: VetsService) {}

  @Get('nearby')
  async findNearbyVets(@Query() query: CoordinatesDto): Promise {
    return this.vetsService.findNearbyVets(
      query.lat,
      query.lng,
      query.radius,
    );
  }

  @Get()
  async findAll(): Promise {
    return this.vetsService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise {
    return this.vetsService.findOne(+id);
  }

  @Post()
  async create(@Body() createVetDto: CreateVetDto): Promise {
    return this.vetsService.create(createVetDto);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateVetDto: Partial,
  ): Promise {
    return this.vetsService.update(+id, updateVetDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise {
    return this.vetsService.remove(+id);
  }
}