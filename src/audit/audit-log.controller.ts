// src/audit/audit-log.controller.ts
import { Controller, Get, Query, UseGuards, Request } from '@nestjs/common';
import { AuditLogService } from './audit-log.service';
import { QueryAuditLogDto } from './dto/query-audit-log.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('audit-logs')
@UseGuards(JwtAuthGuard)
export class AuditLogController {
  constructor(private readonly auditLogService: AuditLogService) {}

  @Get()
  @UseGuards(RolesGuard)
  async findAll(@Query() query: QueryAuditLogDto, @Request() req) {
    const isAdmin = req.user.roles?.includes('admin') || false;
    return this.auditLogService.findAll(query, req.user.id, isAdmin);
  }
}
