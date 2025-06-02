import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Appointment } from './appointment.entity';

@Injectable()
export class AppointmentService {
  constructor(
    @InjectRepository(Appointment)
    private readonly appointmentRepository: Repository<Appointment>,
  ) {}

  // Create Appointment
  async create(appointmentData: Partial<Appointment>): Promise<Appointment> {
    const { vetId, date, time } = appointmentData;

    // Prevent double booking
    const existingAppointment = await this.appointmentRepository.findOne({
      where: { vetId, date, time },
    });

    if (existingAppointment) {
      throw new BadRequestException('Vet is already booked for this time slot.');
    }

    const appointment = this.appointmentRepository.create(appointmentData);
    return this.appointmentRepository.save(appointment);
  }

  // Get All Appointments
  async findAll(): Promise<Appointment[]> {
    return this.appointmentRepository.find();
  }

  // Get Single Appointment
  async findOne(id: number): Promise<Appointment> {
    const appointment = await this.appointmentRepository.findOne({ where: { id } });
    if (!appointment) {
      throw new BadRequestException('Appointment not found.');
    }
    return appointment;
  }

  // Cancel Appointment
  async cancel(id: number): Promise<void> {
    const appointment = await this.findOne(id);
    if (!appointment) {
      throw new BadRequestException('Appointment not found.');
    }
    await this.appointmentRepository.delete(id);
  }

  // Reschedule Appointment
  async reschedule(
    id: number,
    newDate: string,
    newTime: string,
  ): Promise<Appointment> {
    const appointment = await this.findOne(id);

    // Prevent double booking for the new time slot
    const existingAppointment = await this.appointmentRepository.findOne({
      where: { vetId: appointment.vetId, date: newDate, time: newTime },
    });

    if (existingAppointment) {
      throw new BadRequestException('Vet is already booked for this time slot.');
    }

    appointment.date = newDate;
    appointment.time = newTime;
    return this.appointmentRepository.save(appointment);
  }
}