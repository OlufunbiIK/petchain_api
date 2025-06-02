import { Injectable, BadRequestException } from '@nestjs/common';
import { VetsRepository } from './vets.repository';
import { NearbyVetDto } from './dto/nearby-vet.dto';
import { CreateVetDto } from './dto/create-vet.dto';
import { Vet } from './entities/vet.entity';

@Injectable()
export class VetsService {
  constructor(private readonly vetsRepository: VetsRepository) {}

  async findNearbyVets(
    latitude: number,
    longitude: number,
    radius: number,
  ): Promise {
    // Validate inputs
    this.validateCoordinates(latitude, longitude, radius);

    const results = await this.vetsRepository.findNearbyVets(
      latitude,
      longitude,
      radius,
    );

    // Map results to DTOs
    return results.map((result) => {
      const vet = new Vet();
      vet.id = result.id;
      vet.name = result.name;
      vet.address = result.address;
      vet.phone = result.phone;
      vet.specialty = result.specialty;
      vet.latitude = result.latitude;
      vet.longitude = result.longitude;

      return new NearbyVetDto(vet, result.distance);
    });
  }

  async findAll(): Promise {
    return this.vetsRepository.findAll();
  }

  async findOne(id: number): Promise {
    return this.vetsRepository.findOne(id);
  }

  async create(createVetDto: CreateVetDto): Promise {
    return this.vetsRepository.create(createVetDto);
  }

  async update(id: number, updateVetDto: Partial): Promise {
    return this.vetsRepository.update(id, updateVetDto);
  }

  async remove(id: number): Promise {
    return this.vetsRepository.remove(id);
  }

  // Alternative method to calculate Haversine distance in code
  calculateHaversineDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
  ): number {
    // Earth's radius in kilometers
    const R = 6371;

    const latDistance = this.toRadians(lat2 - lat1);
    const lonDistance = this.toRadians(lon2 - lon1);

    const a =
      Math.sin(latDistance / 2) * Math.sin(latDistance / 2) +
      Math.cos(this.toRadians(lat1)) *
        Math.cos(this.toRadians(lat2)) *
        Math.sin(lonDistance / 2) *
        Math.sin(lonDistance / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  }

  private toRadians(degrees: number): number {
    return (degrees * Math.PI) / 180;
  }

  private validateCoordinates(
    latitude: number,
    longitude: number,
    radius: number,
  ): void {
    if (latitude === undefined || longitude === undefined || radius === undefined) {
      throw new BadRequestException('Latitude, longitude, and radius are required');
    }

    if (latitude < -90 || latitude > 90) {
      throw new BadRequestException('Latitude must be between -90 and 90 degrees');
    }

    if (longitude < -180 || longitude > 180) {
      throw new BadRequestException('Longitude must be between -180 and 180 degrees');
    }

    if (radius <= 0) {
      throw new BadRequestException('Radius must be positive');
    }
  }
}