import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Vet } from './entities/vet.entity';

@Injectable()
export class VetsRepository {
  constructor(
    @InjectRepository(Vet)
    private vetsRepository: Repository,
  ) {}

  async findNearbyVets(
    latitude: number,
    longitude: number,
    radius: number,
  ): Promise {
    // Using Haversine formula in raw SQL
    const query = `
      SELECT v.*,
        (6371 * acos(cos(radians(${latitude})) * cos(radians(v.latitude)) * 
         cos(radians(v.longitude) - radians(${longitude})) + 
         sin(radians(${latitude})) * sin(radians(v.latitude)))) AS distance
      FROM vet v
      HAVING distance <= ${radius}
      ORDER BY distance ASC
    `;

    return this.vetsRepository.query(query);
  }

  async findAll(): Promise {
    return this.vetsRepository.find();
  }

  async findOne(id: number): Promise {
    return this.vetsRepository.findOne({ where: { id } });
  }

  async create(vet: Partial): Promise {
    const newVet = this.vetsRepository.create(vet);
    return this.vetsRepository.save(newVet);
  }

  async update(id: number, vet: Partial): Promise {
    await this.vetsRepository.update(id, vet);
    return this.findOne(id);
  }

  async remove(id: number): Promise {
    await this.vetsRepository.delete(id);
  }
}