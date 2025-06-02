import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Pet } from './pet.entity';
import { CreatePetDto } from './dto/create-pet.dto';
import { UpdatePetDto } from './dto/update-pet.dto';
import { Owner } from './owner.entity';
import {
  PetMedicalSummaryDto,
  TreatmentSummaryDto,
  VaccinationSummaryDto,
  AppointmentSummaryDto,
} from './dto/pet-medical-summary.dto';
import { TreatmentHistory } from './treatment-history.entity';
import { Vaccination } from './vaccination.entity';
import { Appointment } from './appointment.entity';

@Injectable()
export class PetService {
  constructor(
    @InjectRepository(Pet) private readonly petRepository: Repository<Pet>,

    @InjectRepository(Owner)
    private readonly ownerRepository: Repository<Owner>,

    @InjectRepository(TreatmentHistory)
    private treatmentsRepository: Repository<TreatmentHistory>,
    @InjectRepository(Vaccination)
    private vaccinationsRepository: Repository<Vaccination>,
    @InjectRepository(Appointment)
    private appointmentsRepository: Repository<Appointment>,
  ) {}

  async create(createPetDto: CreatePetDto): Promise<Pet> {
    const owner = await this.ownerRepository.findOne({
      where: { id: createPetDto.ownerId },
    });
    if (!owner) {
      throw new BadRequestException('Owner not found');
    }
    const pet = this.petRepository.create({ ...createPetDto, owner });
    return this.petRepository.save(pet);
  }

  findAll(): Promise<Pet[]> {
    return this.petRepository.find();
  }

  async findOne(id: number): Promise<Pet> {
    const pet = await this.petRepository.findOne({ where: { id } });
    if (!pet) {
      throw new NotFoundException('Pet not found');
    }
    return pet;
  }

  async update(id: number, updatePetDto: UpdatePetDto): Promise<Pet> {
    const pet = await this.findOne(id);
    if (updatePetDto.ownerId) {
      const owner = await this.ownerRepository.findOne({
        where: { id: updatePetDto.ownerId },
      });
      if (!owner) {
        throw new BadRequestException('Owner not found');
      }
      Object.assign(pet, updatePetDto, { owner });
    } else {
      Object.assign(pet, updatePetDto);
    }
    return this.petRepository.save(pet);
  }

  async remove(id: number): Promise<void> {
    const pet = await this.findOne(id);
    await this.petRepository.remove(pet);
  }

  async findByIdWithRelations(id: number) {
    return this.petRepository.findOne({
      where: { id },
      relations: ['owner', 'vaccines', 'treatments'],
    });
  }

  async getMedicalSummary(petId: number) {
    // Get pet with owner information
    const pet = await this.petRepository.findOne({
      where: { id: petId },
      relations: ['owner'],
    });

    if (!pet) {
      throw new NotFoundException(`Pet with ID ${petId} not found`);
    }

    // Get all treatments for the pet
    const treatments = await this.treatmentsRepository.find({
      where: { pet: { id: petId } },
      relations: ['veterinarian'],
      order: { date: 'DESC' },
    });

    // Get all vaccinations for the pet
    const vaccinations = await this.vaccinationsRepository.find({
      where: { pet: { id: petId } },
      relations: ['veterinarian'],
      order: { dateAdministered: 'DESC' },
    });

    // Get the latest appointment
    const latestAppointment = await this.appointmentsRepository.findOne({
      where: { pet: { id: petId }, status: 'COMPLETED' },
      relations: ['veterinarian', 'clinic'],
      order: { date: 'DESC' },
    });

    // Get upcoming vaccinations (those that need renewal)
    const today = new Date();
    const upcomingVaccinations = vaccinations
      .filter((vaccination) => vaccination.expirationDate > today)
      .sort((a, b) => a.expirationDate.getTime() - b.expirationDate.getTime());

    // Map to DTOs
    const treatmentDtos: any = treatments.map((treatment) => ({
      id: treatment.id,
      date: treatment.date,
      description: treatment.description,
      notes: treatment.notes,
    }));

    const vaccinationDtos: any = vaccinations.map((vaccination) => ({
      id: vaccination.id,
      name: vaccination.vaccineName,
      date: vaccination.dateAdministered,
      expirationDate: vaccination.expirationDate,
      notes: vaccination.notes,
      isUpcoming: vaccination.expirationDate > today,
    }));

    const upcomingVaccinationDtos: any = upcomingVaccinations.map(
      (vaccination) => ({
        id: vaccination.id,
        name: vaccination.vaccineName,
        date: vaccination.dateAdministered,
        expirationDate: vaccination.expirationDate,

        notes: vaccination.notes,
        isUpcoming: true,
      }),
    );

    let appointmentDto: any;
    if (latestAppointment) {
      appointmentDto = {
        id: latestAppointment.id,
        date: latestAppointment.date,
        purpose: latestAppointment.purpose,
        status: latestAppointment.status,
        notes: latestAppointment.notes,
      };
    }

    // Compile the full medical summary
    return {
      id: pet.id,
      name: pet.name,
      species: pet.species,
      breed: pet.breed,
      gender: pet.gender,
      microchipId: pet.microchipId,
      treatments: treatmentDtos,
      vaccinations: vaccinationDtos,
      latestAppointment: appointmentDto,
      upcomingVaccinations: upcomingVaccinationDtos,
      lastUpdated: new Date(),
    };
  }

  // Optimized version with a single query
  async getMedicalSummaryOptimized(petId: number) {
    // Use queryBuilder for a more optimized query
    const pet = await this.petRepository
      .createQueryBuilder('pet')
      .leftJoinAndSelect('pet.owner', 'owner')
      .where('pet.id = :petId', { petId })
      .getOne();

    if (!pet) {
      throw new NotFoundException(`Pet with ID ${petId} not found`);
    }

    // Use Promise.all to run these queries in parallel
    const [treatments, vaccinations, appointments] = await Promise.all([
      this.treatmentsRepository
        .createQueryBuilder('treatment')
        .leftJoinAndSelect('treatment.veterinarian', 'treatmentVet')
        .where('treatment.petId = :petId', { petId })
        .orderBy('treatment.date', 'DESC')
        .getMany(),

      this.vaccinationsRepository
        .createQueryBuilder('vaccination')
        .leftJoinAndSelect('vaccination.veterinarian', 'vaccinationVet')
        .where('vaccination.petId = :petId', { petId })
        .orderBy('vaccination.date', 'DESC')
        .getMany(),

      this.appointmentsRepository
        .createQueryBuilder('appointment')
        .leftJoinAndSelect('appointment.veterinarian', 'appointmentVet')
        .leftJoinAndSelect('appointment.clinic', 'clinic')
        .where('appointment.petId = :petId', { petId })
        .orderBy('appointment.date', 'DESC')
        .getMany(),
    ]);

    const today = new Date();

    // Get latest completed appointment
    const latestAppointment = appointments.find(
      (app) => app.status === 'COMPLETED',
    );

    // Get upcoming vaccinations
    const upcomingVaccinations = vaccinations
      .filter((vac) => vac.expirationDate > today)
      .sort((a, b) => a.expirationDate.getTime() - b.expirationDate.getTime());

    // Map to DTOs (same as before)
    const treatmentDtos: any = treatments.map((treatment) => ({
      id: treatment.id,
      date: treatment.date,
      description: treatment.description,
      veterinarian: treatment.vet,
      notes: treatment.notes,
    }));

    const vaccinationDtos: any = vaccinations.map((vaccination) => ({
      id: vaccination.id,
      name: vaccination.vaccineName,
      date: vaccination.dateAdministered,
      expirationDate: vaccination.expirationDate,
      veterinarian: vaccination.vet,
      notes: vaccination.notes,
      isUpcoming: vaccination.expirationDate > today,
    }));

    const upcomingVaccinationDtos: any = upcomingVaccinations.map(
      (vaccination) => ({
        id: vaccination.id,
        name: vaccination.vaccineName,
        date: vaccination.dateAdministered,
        expirationDate: vaccination.expirationDate,
        veterinarian: vaccination.vet,
        notes: vaccination.notes,
        isUpcoming: true,
      }),
    );

    let appointmentDto: any;
    if (latestAppointment) {
      appointmentDto = {
        id: latestAppointment.id,
        date: latestAppointment.date,
        purpose: latestAppointment.purpose,
        veterinarianName: latestAppointment.id,
        clinicName: latestAppointment.id,
        status: latestAppointment.status,
        notes: latestAppointment.notes,
      };
    }

    // Compile the full medical summary
    return {
      id: pet.id,
      name: pet.name,
      species: pet.species,
      breed: pet.breed,
      birthDate: pet.age,
      gender: pet.gender,
      microchipId: pet.microchipId,
      ownerName: pet.owner.fullName,
      treatments: treatmentDtos,
      vaccinations: vaccinationDtos,
      latestAppointment: appointmentDto,
      upcomingVaccinations: upcomingVaccinationDtos,
      lastUpdated: new Date(),
    };
  }
}
