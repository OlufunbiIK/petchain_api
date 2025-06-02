import { Module } from '@nestjs/common';
import { AppointmentService } from './appointment.service';
import { AppointmentController } from './appointment.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Appointment } from './appointment.entity';
import { Owner } from './owner.entity';
import { Pet } from './pet.entity';
import { Vet } from './vet.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Appointment, Owner, Pet, Vet]), 
  ],
  controllers: [AppointmentController],
  providers: [AppointmentService],
  exports: [AppointmentService], 
})
export class AppointmentModule {}
