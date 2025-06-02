import { Test, TestingModule } from '@nestjs/testing';
import { VetsController } from '../vets.controller';
import { VetsService } from '../vets.service';
import { NearbyVetDto } from '../dto/nearby-vet.dto';
import { Vet } from '../entities/vet.entity';

describe('VetsController', () => {
  let controller: VetsController;
  let service: VetsService;

  const mockVetsService = {
    findNearbyVets: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [VetsController],
      providers: [
        {
          provide: VetsService,
          useValue: mockVetsService,
        },
      ],
    }).compile();

    controller = module.get(VetsController);
    service = module.get(VetsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findNearbyVets', () => {
    it('should return nearby vets', async () => {
      // Mock data
      const mockVets: NearbyVetDto[] = [
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

      mockVetsService.findNearbyVets.mockResolvedValue(mockVets);

      // Execute
      const query = { lat: 40.7128, lng: -74.006, radius: 5 };
      const result = await controller.findNearbyVets(query);

      // Assert
      expect(service.findNearbyVets).toHaveBeenCalledWith(40.7128, -74.006, 5);
      expect(result).toHaveLength(2);
      expect(result[0].name).toBe('ABC Animal Hospital');
    });
  });
});