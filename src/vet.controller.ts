import { Controller, Post, Get, Put, Delete, Body, Param } from '@nestjs/common';
import { VetService } from './vet.service';
import { CreateVetDto } from './dto/create-vet.dto';
import { UpdateVetDto } from './dto/update-vet.dto';
import { Vet } from './vet.entity';

@Controller('vets')
export class VetController {
  constructor(private readonly vetService: VetService) {}

  @Post()
  async create(@Body() createVetDto: CreateVetDto): Promise<Vet> {
    return this.vetService.create(createVetDto);
  }

  @Get()
  async findAll(): Promise<Vet[]> {
    return this.vetService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: number): Promise<Vet> {
    return this.vetService.findOne(id);
  }

  @Put(':id')
  async update(
    @Param('id') id: number,
    @Body() updateVetDto: UpdateVetDto,
  ): Promise<Vet> {
    return this.vetService.update(id, updateVetDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: number): Promise<void> {
    return this.vetService.remove(id);
  }
}