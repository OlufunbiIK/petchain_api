// src/audit/audit-log.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, FindOptionsWhere, Repository } from 'typeorm';
import { AuditLog, AuditAction } from './entities/audit-log.entity';
import { QueryAuditLogDto } from './dto/query-audit-log.dto';

@Injectable()
export class AuditLogService {
  constructor(
    @InjectRepository(AuditLog)
    private auditLogRepository: Repository<AuditLog>,
  ) {}

  async create(auditLogData: {
    resource: string;
    resourceId: string;
    userId: string;
    action: AuditAction;
    before?: any;
    after?: any;
  }): Promise<AuditLog> {
    const auditLog = this.auditLogRepository.create(auditLogData);
    return this.auditLogRepository.save(auditLog);
  }

  async findAll(query: QueryAuditLogDto, userId: string, isAdmin: boolean): Promise<AuditLog[]> {
    const where: FindOptionsWhere<AuditLog> = {};

    // Apply filters based on query params
    if (query.resource) where.resource = query.resource;
    if (query.resourceId) where.resourceId = query.resourceId;
    if (query.action) where.action = query.action;
    
    // Date range filtering
    if (query.fromDate && query.toDate) {
      where.timestamp = Between(
        new Date(query.fromDate),
        new Date(query.toDate),
      );
    }

    // Security: Non-admins can only see their own records
    if (!isAdmin) {
      where.userId = userId;
    } else if (query.userId) {
      // Admins can filter by specific user
      where.userId = query.userId;
    }

    return this.auditLogRepository.find({
      where,
      order: { timestamp: 'DESC' },
    });
  }
}
