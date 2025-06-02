import { Test, TestingModule } from '@nestjs/testing';
import { VetService } from '../vet.service';

describe('VetService', () => {
  let service: VetService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [VetService],
    }).compile();

    service = module.get<VetService>(VetService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
