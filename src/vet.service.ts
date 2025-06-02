import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Vet } from './vet.entity';
import { CreateVetDto } from './dto/create-vet.dto';
import { UpdateVetDto } from './dto/update-vet.dto';

@Injectable()
export class VetService {
  constructor(
    @InjectRepository(Vet)
    private readonly vetRepository: Repository<Vet>,
  ) {}

  // Create a new vet
  async create(createVetDto: CreateVetDto): Promise<Vet> {
    try {
      const vet = this.vetRepository.create(createVetDto);
      return await this.vetRepository.save(vet);
    } catch (error) {
      if (error.code === '23505') { 
        throw new ConflictException('License number already exists.');
      }
      throw error;
    }
  }

  // Find all vets
  async findAll(): Promise<Vet[]> {
    return await this.vetRepository.find();
  }

  // Find a vet by ID
  async findOne(id: number): Promise<Vet> {
    const vet = await this.vetRepository.findOne({ where: { id } });
    if (!vet) {
      throw new NotFoundException(`Vet with ID ${id} not found.`);
    }
    return vet;
  }

  // Update a vet
  async update(id: number, updateVetDto: UpdateVetDto): Promise<Vet> {
    const vet = await this.findOne(id);

    try {
      Object.assign(vet, updateVetDto);
      return await this.vetRepository.save(vet);
    } catch (error) {
      if (error.code === '23505') { // Unique constraint violation
        throw new ConflictException('License number already exists.');
      }
      throw error;
    }
  }

  // Delete a vet
  async remove(id: number): Promise<void> {
    const vet = await this.findOne(id);
    await this.vetRepository.remove(vet);
  }
}