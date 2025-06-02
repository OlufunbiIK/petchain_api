import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  ParseIntPipe,
  UsePipes,
  ValidationPipe,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import { PetService } from './pet.service';
import { CreatePetDto } from './dto/create-pet.dto';
import { UpdatePetDto } from './dto/update-pet.dto';
import { Pet } from './pet.entity';
import { PdfService } from './pdf.service';

@Controller('pets')
@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
export class PetController {
  constructor(
    private readonly petService: PetService,
    private readonly pdfService: PdfService,
  ) {}

  @Post()
  async create(@Body() createPetDto: CreatePetDto): Promise<Pet> {
    return this.petService.create(createPetDto);
  }

  @Get()
  async findAll(): Promise<Pet[]> {
    return this.petService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<Pet> {
    return this.petService.findOne(id);
  }

  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePetDto: UpdatePetDto,
  ): Promise<Pet> {
    return this.petService.update(id, updatePetDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.petService.remove(id);
  }

  @Get(':id/export')
  async exportPet(
    @Param('id') id: number,
    @Res() res: Response, // Explicitly type the response as express.Response
  ) {
    const pet = await this.petService.findByIdWithRelations(id);

    if (!pet) {
      throw new NotFoundException('Pet not found');
    }

    this.pdfService.generatePetPDF(res, pet);
  }

  @Get(':id/medical-summary')
  async getMedicalSummary(@Param('id', ParseIntPipe) id: number) {
    return this.petService.getMedicalSummaryOptimized(id);
  }
}
