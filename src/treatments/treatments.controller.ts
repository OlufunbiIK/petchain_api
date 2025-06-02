// src/treatments/treatments.controller.ts
import { Controller, Get, Post, Body, Put, Param, Delete, UseGuards } from '@nestjs/common';
import { TreatmentsService } from './treatments.service';
import { CreateTreatmentDto } from './dto/create-treatment.dto';
import { UpdateTreatmentDto } from './dto/update-treatment.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AuditLog } from '../audit/interceptors/audit-log.interceptor';
import { AuditAction } from '../audit/entities/audit-log.entity';

@Controller('treatments')
@UseGuards(JwtAuthGuard)
@AuditLog({
  resource: 'treatments',
  getResourceId: (request, response) => {
    return request.method === 'POST' 
      ? response.id 
      : request.params.id;
  },
  actions: {
    POST: AuditAction.CREATE,
    PUT: AuditAction.UPDATE,
    PATCH: AuditAction.UPDATE,
    DELETE: AuditAction.DELETE,
  },
  getBeforeEntity: async (request) => {
    // This is just a placeholder. In a real application, you would inject
    // your service and fetch the existing entity before changes
    const treatmentService = request.app.get(TreatmentsService);
    return await treatmentService.findOne(request.params.id);
  },
})
export class TreatmentsController {
  constructor(private readonly treatmentsService: TreatmentsService) {}

  @Post()
  create(@Body() createTreatmentDto: CreateTreatmentDto) {
    return this.treatmentsService.create(createTreatmentDto);
  }

  @Get()
  findAll() {
    return this.treatmentsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.treatmentsService.findOne(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateTreatmentDto: UpdateTreatmentDto) {
    return this.treatmentsService.update(id, updateTreatmentDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.treatmentsService.remove(id);
  }
}
