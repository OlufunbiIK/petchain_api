import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { TreatmentHistoryService } from './treatment-history.service';
import { CreateTreatmentHistoryDto } from './dto/create-treatment-history.dto';
import { UpdateTreatmentHistoryDto } from './dto/update-treatment-history.dto';
import { FilterTreatmentHistoryDto } from './dto/filter-treatment-history.dto';
import { TreatmentHistory } from './treatment-history.entity';

@Controller('treatment-history')
export class TreatmentHistoryController {
  constructor(
    private readonly treatmentHistoryService: TreatmentHistoryService,
  ) {}

  @Post()
  create(
    @Body() createTreatmentHistoryDto: CreateTreatmentHistoryDto,
  ): Promise<TreatmentHistory> {
    return this.treatmentHistoryService.create(createTreatmentHistoryDto);
  }

  @Get()
  findAll(@Query() filterDto: FilterTreatmentHistoryDto) {
    return this.treatmentHistoryService.findAll(filterDto);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number): Promise<TreatmentHistory> {
    return this.treatmentHistoryService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateTreatmentHistoryDto: UpdateTreatmentHistoryDto,
  ): Promise<TreatmentHistory> {
    return this.treatmentHistoryService.update(id, updateTreatmentHistoryDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.treatmentHistoryService.remove(id);
  }

  @Get('pet/:petId')
  findByPet(
    @Param('petId', ParseIntPipe) petId: number,
    @Query() filterDto: FilterTreatmentHistoryDto,
  ) {
    return this.treatmentHistoryService.findByPet(petId, filterDto);
  }

  @Get('vet/:vetId')
  findByVet(
    @Param('vetId', ParseIntPipe) vetId: number,
    @Query() filterDto: FilterTreatmentHistoryDto,
  ) {
    return this.treatmentHistoryService.findByVet(vetId, filterDto);
  }
}
