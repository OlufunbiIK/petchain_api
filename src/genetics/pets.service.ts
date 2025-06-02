// pets.service.ts update (partial - assuming existing service)
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Pet } from './pet.entity';

@Injectable()
export class PetsService {
  constructor(
    @InjectRepository(Pet)
    private petsRepository: Repository<Pet>,
  ) {}

  findAll(): Promise<Pet[]> {
    return this.petsRepository.find();
  }

  findOne(id: number): Promise<Pet> {
    return this.petsRepository.findOne({ where: { id } });
  }

  async create(pet: Partial<Pet>): Promise<Pet> {
    const newPet = this.petsRepository.create(pet);
    return this.petsRepository.save(newPet);
  }

  async update(id: number, pet: Partial<Pet>): Promise<Pet> {
    await this.petsRepository.update(id, pet);
    return this.petsRepository.findOne({ where: { id } });
  }

  async remove(id: number): Promise<void> {
    await this.petsRepository.delete(id);
  }
}
