import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Vet } from './vet.entity';
import { VetService } from './vet.service';
import { VetController } from './vet.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Vet])],
  controllers: [VetController],
  providers: [VetService],
})
export class VetModule {}