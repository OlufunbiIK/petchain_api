// src/audit/tests/audit-log.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLogService } from '../audit-log.service';
import { AuditLog, AuditAction } from '../entities/audit-log.entity';

describe('AuditLogService', () => {
  let service: AuditLogService;
  let repository: Repository<AuditLog>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuditLogService,
        {
          provide: getRepositoryToken(AuditLog),
          useClass: Repository,
        },
      ],
    }).compile();

    service = module.get<AuditLogService>(AuditLogService);
    repository = module.get<Repository<AuditLog>>(getRepositoryToken(AuditLog));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create an audit log entry', async () => {
      const auditLogData = {
        resource: 'treatments',
        resourceId: '123',
        userId: 'user1',
        action: AuditAction.CREATE,
        after: { id: '123', name: 'Test Treatment' },
      };

      const savedEntity = { ...auditLogData, id: 'uuid', timestamp: new Date() };
      
      jest.spyOn(repository, 'create').mockReturnValue(auditLogData as any);
      jest.spyOn(repository, 'save').mockResolvedValue(savedEntity as any);

      const result = await service.create(auditLogData);
      
      expect(repository.create).toHaveBeenCalledWith(auditLogData);
      expect(repository.save).toHaveBeenCalled();
      expect(result).toEqual(savedEntity);
    });
  });

  describe('findAll', () => {
    it('should return all audit logs for admins', async () => {
      const mockLogs = [{ id: '1', resource: 'treatments' }];
      jest.spyOn(repository, 'find').mockResolvedValue(mockLogs as any);

      const result = await service.findAll({}, 'adminId', true);
      
      expect(repository.find).toHaveBeenCalledWith({
        where: {},
        order: { timestamp: 'DESC' },
      });
      expect(result).toEqual(mockLogs);
    });

    it('should filter logs for non-admin users', async () => {
      const userId = 'user1';
      const mockLogs = [{ id: '1', resource: 'treatments', userId }];
      jest.spyOn(repository, 'find').mockResolvedValue(mockLogs as any);

      const result = await service.findAll({}, userId, false);
      
      expect(repository.find).toHaveBeenCalledWith({
        where: { userId },
        order: { timestamp: 'DESC' },
      });
      expect(result).toEqual(mockLogs);
    });
  });
});
