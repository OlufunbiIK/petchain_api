// First, let's define our DTOs for filtering
// dto/query-params.dto.ts
import { IsOptional, IsInt, Min, Max, IsString, IsEnum, IsArray, IsDate } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class PaginationDto {
  @ApiProperty({ description: 'Page number (starts from 1)', default: 1, required: false })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  page?: number = 1;

  @ApiProperty({ description: 'Number of items per page', default: 10, required: false })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  @Type(() => Number)
  limit?: number = 10;
}

export class SearchDto extends PaginationDto {
  @ApiProperty({ description: 'Search keyword to match across multiple fields', required: false })
  @IsOptional()
  @IsString()
  search?: string;
}

// dto/pet-query.dto.ts
import { SearchDto } from './query-params.dto';

export enum PetSpecies {
  DOG = 'dog',
  CAT = 'cat',
  BIRD = 'bird',
  RABBIT = 'rabbit',
  HAMSTER = 'hamster',
  OTHER = 'other',
}

export class PetQueryDto extends SearchDto {
  @ApiProperty({ enum: PetSpecies, description: 'Filter by pet species', required: false })
  @IsOptional()
  @IsEnum(PetSpecies)
  species?: PetSpecies;

  @ApiProperty({ description: 'Filter by pet breed', required: false })
  @IsOptional()
  @IsString()
  breed?: string;

  @ApiProperty({ description: 'Filter by minimum age in years', required: false })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Type(() => Number)
  minAge?: number;

  @ApiProperty({ description: 'Filter by maximum age in years', required: false })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Type(() => Number)
  maxAge?: number;
  
  @ApiProperty({ description: 'Filter by owner ID', required: false })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  ownerId?: number;

  @ApiProperty({ description: 'Sort field', enum: ['name', 'age', 'species', 'createdAt'], default: 'createdAt', required: false })
  @IsOptional()
  @IsString()
  sortBy?: string = 'createdAt';

  @ApiProperty({ description: 'Sort order', enum: ['ASC', 'DESC'], default: 'DESC', required: false })
  @IsOptional()
  @IsEnum(['ASC', 'DESC'])
  sortOrder?: 'ASC' | 'DESC' = 'DESC';
}

// dto/vet-query.dto.ts
import { SearchDto } from './query-params.dto';

export enum VetSpecialty {
  GENERAL = 'general',
  SURGERY = 'surgery',
  DENTISTRY = 'dentistry',
  CARDIOLOGY = 'cardiology',
  DERMATOLOGY = 'dermatology',
  NUTRITION = 'nutrition',
  ORTHOPEDICS = 'orthopedics',
  OTHER = 'other',
}

export class VetQueryDto extends SearchDto {
  @ApiProperty({ enum: VetSpecialty, description: 'Filter by veterinarian specialty', required: false })
  @IsOptional()
  @IsEnum(VetSpecialty)
  specialty?: VetSpecialty;

  @ApiProperty({ description: 'Filter by years of experience (minimum)', required: false })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Type(() => Number)
  minExperience?: number;

  @ApiProperty({ description: 'Filter by years of experience (maximum)', required: false })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Type(() => Number)
  maxExperience?: number;

  @ApiProperty({ description: 'Filter by availability (true/false)', required: false })
  @IsOptional()
  @Type(() => Boolean)
  available?: boolean;

  @ApiProperty({ description: 'Sort field', enum: ['name', 'experience', 'specialty', 'rating', 'createdAt'], default: 'createdAt', required: false })
  @IsOptional()
  @IsString()
  sortBy?: string = 'createdAt';

  @ApiProperty({ description: 'Sort order', enum: ['ASC', 'DESC'], default: 'DESC', required: false })
  @IsOptional()
  @IsEnum(['ASC', 'DESC'])
  sortOrder?: 'ASC' | 'DESC' = 'DESC';
}

// Now let's create our controllers
// controllers/pets.controller.ts
import { 
  Controller, Get, Query, ParseIntPipe, Param, 
  UseInterceptors, ClassSerializerInterceptor, HttpException, HttpStatus
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { PetQueryDto } from '../dto/pet-query.dto';
import { PetsService } from '../services/pets.service';
import { PaginatedResponseDto } from '../dto/paginated-response.dto';
import { Pet } from '../entities/pet.entity';

@ApiTags('pets')
@Controller('pets')
@UseInterceptors(ClassSerializerInterceptor)
export class PetsController {
  constructor(private readonly petsService: PetsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all pets with filters and pagination' })
  @ApiResponse({ 
    status: 200, 
    description: 'Returns paginated pets data',
    type: PaginatedResponseDto
  })
  async findAll(@Query() query: PetQueryDto): Promise<PaginatedResponseDto<Pet>> {
    try {
      return await this.petsService.findAll(query);
    } catch (error) {
      throw new HttpException(
        `Failed to fetch pets: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get pet by ID' })
  @ApiResponse({ status: 200, description: 'Returns a pet by ID', type: Pet })
  @ApiResponse({ status: 404, description: 'Pet not found' })
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<Pet> {
    const pet = await this.petsService.findOne(id);
    if (!pet) {
      throw new HttpException('Pet not found', HttpStatus.NOT_FOUND);
    }
    return pet;
  }
}

// controllers/vets.controller.ts
import { 
  Controller, Get, Query, ParseIntPipe, Param, 
  UseInterceptors, ClassSerializerInterceptor, HttpException, HttpStatus
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { VetQueryDto } from '../dto/vet-query.dto';
import { VetsService } from '../services/vets.service';
import { PaginatedResponseDto } from '../dto/paginated-response.dto';
import { Vet } from '../entities/vet.entity';

@ApiTags('vets')
@Controller('vets')
@UseInterceptors(ClassSerializerInterceptor)
export class VetsController {
  constructor(private readonly vetsService: VetsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all vets with filters and pagination' })
  @ApiResponse({ 
    status: 200, 
    description: 'Returns paginated vets data',
    type: PaginatedResponseDto
  })
  async findAll(@Query() query: VetQueryDto): Promise<PaginatedResponseDto<Vet>> {
    try {
      return await this.vetsService.findAll(query);
    } catch (error) {
      throw new HttpException(
        `Failed to fetch vets: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get vet by ID' })
  @ApiResponse({ status: 200, description: 'Returns a vet by ID', type: Vet })
  @ApiResponse({ status: 404, description: 'Vet not found' })
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<Vet> {
    const vet = await this.vetsService.findOne(id);
    if (!vet) {
      throw new HttpException('Vet not found', HttpStatus.NOT_FOUND);
    }
    return vet;
  }
}

// Let's implement our services
// services/pets.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, Between, FindOptionsWhere, ILike } from 'typeorm';
import { Pet } from '../entities/pet.entity';
import { PetQueryDto } from '../dto/pet-query.dto';
import { PaginatedResponseDto } from '../dto/paginated-response.dto';

@Injectable()
export class PetsService {
  constructor(
    @InjectRepository(Pet)
    private petsRepository: Repository<Pet>,
  ) {}

  async findAll(query: PetQueryDto): Promise<PaginatedResponseDto<Pet>> {
    const {
      page = 1,
      limit = 10,
      search,
      species,
      breed,
      minAge,
      maxAge,
      ownerId,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
    } = query;

    const skip = (page - 1) * limit;
    
    // Build where conditions based on filters
    const whereConditions: FindOptionsWhere<Pet> = {};
    
    if (species) {
      whereConditions.species = species;
    }
    
    if (breed) {
      whereConditions.breed = breed;
    }
    
    if (minAge !== undefined || maxAge !== undefined) {
      whereConditions.age = Between(minAge || 0, maxAge || 100);
    }
    
    if (ownerId) {
      whereConditions.owner = { id: ownerId };
    }
    
    // Search implementation
    const searchConditions = [];
    if (search) {
      searchConditions.push(
        { name: ILike(`%${search}%`) },
        { breed: ILike(`%${search}%`) },
        { description: ILike(`%${search}%`) }
      );
    }
    
    // Build query with conditions
    const queryBuilder = this.petsRepository.createQueryBuilder('pet');
    
    // Apply where conditions
    Object.entries(whereConditions).forEach(([key, value]) => {
      if (key === 'age') {
        queryBuilder.andWhere(`pet.age BETWEEN :minAge AND :maxAge`, {
          minAge: minAge || 0,
          maxAge: maxAge || 100,
        });
      } else if (key === 'owner') {
        queryBuilder.andWhere(`pet.ownerId = :ownerId`, { ownerId });
      } else {
        queryBuilder.andWhere(`pet.${key} = :${key}`, { [key]: value });
      }
    });
    
    // Apply search if provided
    if (search) {
      queryBuilder.andWhere(
        `(pet.name ILIKE :search OR pet.breed ILIKE :search OR pet.description ILIKE :search)`,
        { search: `%${search}%` }
      );
    }
    
    // Apply sorting
    queryBuilder.orderBy(`pet.${sortBy}`, sortOrder);
    
    // Apply pagination
    queryBuilder.skip(skip).take(limit);
    
    // Add relations if needed
    queryBuilder.leftJoinAndSelect('pet.owner', 'owner');
    
    // Execute query
    const [items, totalCount] = await queryBuilder.getManyAndCount();
    
    return {
      items,
      meta: {
        totalItems: totalCount,
        itemCount: items.length,
        itemsPerPage: limit,
        totalPages: Math.ceil(totalCount / limit),
        currentPage: page,
      },
    };
  }

  async findOne(id: number): Promise<Pet> {
    return this.petsRepository.findOne({
      where: { id },
      relations: ['owner']
    });
  }
}

// services/vets.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, Between, FindOptionsWhere, ILike } from 'typeorm';
import { Vet } from '../entities/vet.entity';
import { VetQueryDto } from '../dto/vet-query.dto';
import { PaginatedResponseDto } from '../dto/paginated-response.dto';

@Injectable()
export class VetsService {
  constructor(
    @InjectRepository(Vet)
    private vetsRepository: Repository<Vet>,
  ) {}

  async findAll(query: VetQueryDto): Promise<PaginatedResponseDto<Vet>> {
    const {
      page = 1,
      limit = 10,
      search,
      specialty,
      minExperience,
      maxExperience,
      available,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
    } = query;

    const skip = (page - 1) * limit;
    
    // Build where conditions based on filters
    const whereConditions: FindOptionsWhere<Vet> = {};
    
    if (specialty) {
      whereConditions.specialty = specialty;
    }
    
    if (available !== undefined) {
      whereConditions.available = available;
    }
    
    // Build query with conditions
    const queryBuilder = this.vetsRepository.createQueryBuilder('vet');
    
    // Apply where conditions
    Object.entries(whereConditions).forEach(([key, value]) => {
      queryBuilder.andWhere(`vet.${key} = :${key}`, { [key]: value });
    });
    
    // Handle experience range
    if (minExperience !== undefined || maxExperience !== undefined) {
      queryBuilder.andWhere(`vet.yearsOfExperience BETWEEN :minExp AND :maxExp`, {
        minExp: minExperience || 0,
        maxExp: maxExperience || 100,
      });
    }
    
    // Apply search if provided
    if (search) {
      queryBuilder.andWhere(
        `(vet.firstName ILIKE :search OR vet.lastName ILIKE :search OR vet.bio ILIKE :search OR vet.specialty ILIKE :search)`,
        { search: `%${search}%` }
      );
    }
    
    // Apply sorting
    if (sortBy === 'name') {
      queryBuilder.orderBy('vet.lastName', sortOrder)
                 .addOrderBy('vet.firstName', sortOrder);
    } else if (sortBy === 'experience') {
      queryBuilder.orderBy('vet.yearsOfExperience', sortOrder);
    } else {
      queryBuilder.orderBy(`vet.${sortBy}`, sortOrder);
    }
    
    // Apply pagination
    queryBuilder.skip(skip).take(limit);
    
    // Add relations if needed
    queryBuilder.leftJoinAndSelect('vet.clinic', 'clinic');
    
    // Execute query
    const [items, totalCount] = await queryBuilder.getManyAndCount();
    
    return {
      items,
      meta: {
        totalItems: totalCount,
        itemCount: items.length,
        itemsPerPage: limit,
        totalPages: Math.ceil(totalCount / limit),
        currentPage: page,
      },
    };
  }

  async findOne(id: number): Promise<Vet> {
    return this.vetsRepository.findOne({
      where: { id },
      relations: ['clinic']
    });
  }
}

// Let's define the paginated response DTO
// dto/paginated-response.dto.ts
import { ApiProperty } from '@nestjs/swagger';

export class PaginationMetaDto {
  @ApiProperty()
  totalItems: number;

  @ApiProperty()
  itemCount: number;

  @ApiProperty()
  itemsPerPage: number;

  @ApiProperty()
  totalPages: number;

  @ApiProperty()
  currentPage: number;
}

export class PaginatedResponseDto<T> {
  @ApiProperty({ isArray: true })
  items: T[];

  @ApiProperty()
  meta: PaginationMetaDto;
}

// Let's define simplified entity structures
// entities/pet.entity.ts
import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { PetSpecies } from '../dto/pet-query.dto';
import { Owner } from './owner.entity';

@Entity('pets')
export class Pet {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({
    type: 'enum',
    enum: PetSpecies,
    default: PetSpecies.OTHER
  })
  species: PetSpecies;

  @Column({ nullable: true })
  breed: string;

  @Column()
  age: number;

  @Column({ nullable: true })
  description: string;

  @ManyToOne(() => Owner, owner => owner.pets)
  @JoinColumn({ name: 'ownerId' })
  owner: Owner;

  @Column()
  ownerId: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

// entities/vet.entity.ts
import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { VetSpecialty } from '../dto/vet-query.dto';
import { Clinic } from './clinic.entity';

@Entity('vets')
export class Vet {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({
    type: 'enum',
    enum: VetSpecialty,
    default: VetSpecialty.GENERAL
  })
  specialty: VetSpecialty;

  @Column()
  yearsOfExperience: number;

  @Column({ default: true })
  available: boolean;

  @Column({ nullable: true })
  bio: string;

  @Column({ type: 'decimal', precision: 3, scale: 2, default: 0 })
  rating: number;

  @ManyToOne(() => Clinic, clinic => clinic.vets)
  @JoinColumn({ name: 'clinicId' })
  clinic: Clinic;

  @Column({ nullable: true })
  clinicId: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

// Let's define placeholder relationship entities
// entities/owner.entity.ts
import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { Pet } from './pet.entity';

@Entity('owners')
export class Owner {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @OneToMany(() => Pet, pet => pet.owner)
  pets: Pet[];
}

// entities/clinic.entity.ts
import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { Vet } from './vet.entity';

@Entity('clinics')
export class Clinic {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  address: string;

  @OneToMany(() => Vet, vet => vet.clinic)
  vets: Vet[];
}

// Finally, let's define module configuration
// module/app.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PetsController } from './controllers/pets.controller';
import { VetsController } from './controllers/vets.controller';
import { PetsService } from './services/pets.service';
import { VetsService } from './services/vets.service';
import { Pet } from './entities/pet.entity';
import { Vet } from './entities/vet.entity';
import { Owner } from './entities/owner.entity';
import { Clinic } from './entities/clinic.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      username: process.env.DB_USERNAME || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      database: process.env.DB_DATABASE || 'petclinic',
      entities: [Pet, Vet, Owner, Clinic],
      synchronize: false, // Set to false in production
    }),
    TypeOrmModule.forFeature([Pet, Vet, Owner, Clinic]),
  ],
  controllers: [PetsController, VetsController],
  providers: [PetsService, VetsService],
})
export class AppModule {}