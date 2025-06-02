import { Vet } from '../entities/vet.entity';

export class NearbyVetDto {
  id: number;
  name: string;
  address: string;
  phone: string;
  specialty?: string;
  latitude: number;
  longitude: number;
  distance: number; // in kilometers

  constructor(vet: Vet, distance: number) {
    this.id = vet.id;
    this.name = vet.name;
    this.address = vet.address;
    this.phone = vet.phone;
    this.specialty = vet.specialty;
    this.latitude = vet.latitude;
    this.longitude = vet.longitude;
    this.distance = distance;
  }
}