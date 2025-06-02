import { Test, TestingModule } from '@nestjs/testing';
import { VetsService } from '../vets.service';
import { VetsRepository } from '../vets.repository';
import { BadRequestException } from '@nestjs/common';

describe('VetsService', () => {
  let service: VetsService;
  let repository: VetsRepository;

  const mockVetsRepository = {
    findNearbyVets: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VetsService,
        {
          provide: VetsRepository,
          useValue: mockVetsRepository,
        },
      ],
    }).compile();

    service = module.get(VetsService);
    repository = module.get(VetsRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findNearbyVets', () => {
    it('should return nearby vets', async () => {
      // Mock data
      const mockResults = [
        {
          id: 1,
          name: 'ABC Animal Hospital',
          address: '123 Main St',
          phone: '123-456-7890',
          specialty: 'General',
          latitude: 40.7128,
          longitude: -74.006,
          distance: 0,
        },
        {
          id: 2,
          name: 'XYZ Veterinary',
          address: '456 Park Ave',
          phone: '987-654-3210',
          specialty: 'Surgery',
          latitude: 40.72,
          longitude: -74.01,
          distance: 1.2,
        },
      ];

      mockVetsRepository.findNearbyVets.mockResolvedValue(mockResults);

      // Execute
      const result = await service.findNearbyVets(40.7128, -74.006, 5);

      // Assert
      expect(repository.findNearbyVets).toHaveBeenCalledWith(40.7128, -74.006, 5);
      expect(result).toHaveLength(2);
      expect(result[0].name).toBe('ABC Animal Hospital');
      expect(result[0].distance).toBe(0);
      expect(result[1].name).toBe('XYZ Veterinary');
    });

    it('should throw exception for invalid latitude', async () => {
      await expect(service.findNearbyVets(100, 0, 5)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw exception for invalid longitude', async () => {
      await expect(service.findNearbyVets(0, 200, 5)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw exception for invalid radius', async () => {
      await expect(service.findNearbyVets(0, 0, -5)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('calculateHaversineDistance', () => {
    it('should calculate distance between two points correctly', () => {
      // New York City to Boston (approximately 306 km)
      const distance = service.calculateHaversineDistance(
        40.7128,
        -74.006,
        42.3601,
        -71.0589,
      );

      // Allow for some margin of error
      expect(distance).toBeGreaterThan(300);
      expect(distance).toBeLessThan(310);
    });
  });
});
