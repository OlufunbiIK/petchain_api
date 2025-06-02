import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VetsController } from './vets.controller';
import { VetsService } from './vets.service';
import { VetsRepository } from './vets.repository';
import { Vet } from './entities/vet.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Vet])],
  controllers: [VetsController],
  providers: [VetsService, VetsRepository],
  exports: [VetsService],
})
export class VetsModule {}

