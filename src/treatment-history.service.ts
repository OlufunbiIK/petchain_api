import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Repository,
  Between,
  Like,
  FindManyOptions,
  In,
  LessThanOrEqual,
  MoreThanOrEqual,
} from 'typeorm';
import { CreateTreatmentHistoryDto } from './dto/create-treatment-history.dto';
import { UpdateTreatmentHistoryDto } from './dto/update-treatment-history.dto';
import { FilterTreatmentHistoryDto } from './dto/filter-treatment-history.dto';
import { Pet } from './pet.entity';
import { TreatmentHistory } from './treatment-history.entity';
import { Vet } from './vet.entity';

@Injectable()
export class TreatmentHistoryService {
  constructor(
    @InjectRepository(TreatmentHistory)
    private treatmentHistoryRepository: Repository<TreatmentHistory>,
    @InjectRepository(Pet)
    private petRepository: Repository<Pet>,
    @InjectRepository(Vet)
    private vetRepository: Repository<Vet>,
  ) {}

  async create(
    createTreatmentHistoryDto: CreateTreatmentHistoryDto,
  ): Promise<TreatmentHistory> {
    const { petId, vetId } = createTreatmentHistoryDto;

    // Verify pet exists
    const pet = await this.petRepository.findOne({ where: { id: petId } });
    if (!pet) {
      throw new NotFoundException(`Pet with ID ${petId} not found`);
    }

    // Verify vet exists
    const vet = await this.vetRepository.findOne({ where: { id: vetId } });
    if (!vet) {
      throw new NotFoundException(`Vet with ID ${vetId} not found`);
    }

    // Create new treatment record
    const treatment = this.treatmentHistoryRepository.create(
      createTreatmentHistoryDto,
    );
    return this.treatmentHistoryRepository.save(treatment);
  }

  async findAll(filterDto: FilterTreatmentHistoryDto): Promise<{
    data: TreatmentHistory[];
    total: number;
    page: number;
    pageCount: number;
  }> {
    const {
      treatmentType,
      startDate,
      endDate,
      petId,
      vetId,
      search,
      page = 1,
      limit = 10,
    } = filterDto;

    const skip = (page - 1) * limit;

    // Build query with filters
    const queryOptions: FindManyOptions<TreatmentHistory> = {
      relations: ['pet', 'vet'],
      where: {},
      take: limit,
      skip,
      order: { date: 'DESC' },
    };

    // Add filters if provided
    if (treatmentType && treatmentType.length > 0) {
      queryOptions.where = {
        ...queryOptions.where,
        treatmentType:
          treatmentType.length === 1 ? treatmentType[0] : In(treatmentType),
      };
    }

    if (startDate && endDate) {
      if (startDate > endDate) {
        throw new BadRequestException('Start date cannot be after end date');
      }

      queryOptions.where = {
        ...queryOptions.where,
        date: Between(startDate, endDate),
      };
    } else if (startDate) {
      queryOptions.where = {
        ...queryOptions.where,
        date: MoreThanOrEqual(startDate),
      };
    } else if (endDate) {
      queryOptions.where = {
        ...queryOptions.where,
        date: LessThanOrEqual(endDate),
      };
    }

    if (petId) {
      queryOptions.where = {
        ...queryOptions.where,
        petId,
      };
    }

    if (vetId) {
      queryOptions.where = {
        ...queryOptions.where,
        vetId,
      };
    }

    if (search) {
      queryOptions.where = [
        { ...queryOptions.where, description: Like(`%${search}%`) },
        { ...queryOptions.where, notes: Like(`%${search}%`) },
      ];
    }

    // Get results and count
    const [treatments, total] =
      await this.treatmentHistoryRepository.findAndCount(queryOptions);

    const pageCount = Math.ceil(total / limit);

    return {
      data: treatments,
      total,
      page,
      pageCount,
    };
  }

  async findOne(id: number): Promise<TreatmentHistory> {
    const treatment = await this.treatmentHistoryRepository.findOne({
      where: { id },
      relations: ['pet', 'vet'],
    });

    if (!treatment) {
      throw new NotFoundException(`Treatment with ID ${id} not found`);
    }

    return treatment;
  }

  async update(
    id: number,
    updateTreatmentHistoryDto: UpdateTreatmentHistoryDto,
  ): Promise<TreatmentHistory> {
    const treatment = await this.findOne(id);

    // Check related entities if they're being updated
    if (updateTreatmentHistoryDto.petId) {
      const pet = await this.petRepository.findOne({
        where: { id: updateTreatmentHistoryDto.petId },
      });
      if (!pet) {
        throw new NotFoundException(
          `Pet with ID ${updateTreatmentHistoryDto.petId} not found`,
        );
      }
    }

    if (updateTreatmentHistoryDto.vetId) {
      const vet = await this.vetRepository.findOne({
        where: { id: updateTreatmentHistoryDto.vetId },
      });
      if (!vet) {
        throw new NotFoundException(
          `Vet with ID ${updateTreatmentHistoryDto.vetId} not found`,
        );
      }
    }

    // Update fields
    Object.assign(treatment, updateTreatmentHistoryDto);

    return this.treatmentHistoryRepository.save(treatment);
  }

  async remove(id: number): Promise<void> {
    const treatment = await this.findOne(id);
    await this.treatmentHistoryRepository.remove(treatment);
  }

  async findByPet(
    petId: number,
    filterDto: FilterTreatmentHistoryDto,
  ): Promise<{
    data: TreatmentHistory[];
    total: number;
    page: number;
    pageCount: number;
  }> {
    // Verify pet exists
    const pet = await this.petRepository.findOne({ where: { id: petId } });
    if (!pet) {
      throw new NotFoundException(`Pet with ID ${petId} not found`);
    }

    // Override petId in filter
    filterDto.petId = petId;

    return this.findAll(filterDto);
  }

  async findByVet(
    vetId: number,
    filterDto: FilterTreatmentHistoryDto,
  ): Promise<{
    data: TreatmentHistory[];
    total: number;
    page: number;
    pageCount: number;
  }> {
    // Verify vet exists
    const vet = await this.vetRepository.findOne({ where: { id: vetId } });
    if (!vet) {
      throw new NotFoundException(`Vet with ID ${vetId} not found`);
    }

    // Override vetId in filter
    filterDto.vetId = vetId;

    return this.findAll(filterDto);
  }
}
