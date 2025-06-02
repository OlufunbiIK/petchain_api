import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';

export enum PetClinicEventType {
  VACCINATION_DUE = 'vaccination.due',
  VACCINATION_CREATED = 'vaccination.created',
  TREATMENT_ADDED = 'treatment.added',
  APPOINTMENT_SCHEDULED = 'appointment.scheduled',
  APPOINTMENT_RESCHEDULED = 'appointment.rescheduled',
  APPOINTMENT_CANCELLED = 'appointment.cancelled',
  MEDICATION_REMINDER = 'medication.reminder',
  TEST_RESULTS_READY = 'test.results.ready',
  EMERGENCY_ALERT = 'emergency.alert',
  INVENTORY_LOW = 'inventory.low',
}

@Injectable()
export class EventsService {
  private logger = new Logger('EventsService');

  constructor(private eventEmitter: EventEmitter2) {}

  // Emit a vaccination due event
  emitVaccinationDue(data: {
    petId: string;
    petName: string;
    ownerId: string;
    vaccinationType: string;
    dueDate: Date;
  }) {
    this.logger.log(`Emitting vaccination due event for pet ${data.petId}`);
    this.eventEmitter.emit(PetClinicEventType.VACCINATION_DUE, data);
  }

  // Emit a new treatment event
  emitTreatmentAdded(data: {
    petId: string;
    petName: string;
    ownerId: string;
    treatmentName: string;
    vetId: string;
  }) {
    this.logger.log(`Emitting treatment added event for pet ${data.petId}`);
    this.eventEmitter.emit(PetClinicEventType.TREATMENT_ADDED, data);
  }

  // Emit an appointment rescheduled event
  emitAppointmentRescheduled(data: {
    appointmentId: string;
    ownerId: string;
    vetId: string;
    petName: string;
    oldDateTime: Date;
    newDateTime: Date;
  }) {
    this.logger.log(
      `Emitting appointment rescheduled event for appointment ${data.appointmentId}`,
    );
    this.eventEmitter.emit(PetClinicEventType.APPOINTMENT_RESCHEDULED, data);
  }

  // Emit a medication reminder event
  emitMedicationReminder(data: {
    petId: string;
    petName: string;
    ownerId: string;
    medicationName: string;
    dosage: string;
    reminderTime: Date;
    instructions?: string;
  }) {
    this.logger.log(`Emitting medication reminder for pet ${data.petId}`);
    this.eventEmitter.emit(PetClinicEventType.MEDICATION_REMINDER, data);
  }

  // Emit test results ready event
  emitTestResultsReady(data: {
    testId: string;
    petId: string;
    petName: string;
    ownerId: string;
    vetId: string;
    testType: string;
    resultSummary: string;
    resultDate: Date;
  }) {
    this.logger.log(`Emitting test results ready for test ${data.testId}`);
    this.eventEmitter.emit(PetClinicEventType.TEST_RESULTS_READY, data);
  }

  // Emit emergency alert event
  emitEmergencyAlert(data: {
    clinicId: string;
    alertType: string;
    message: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    affectedRoles: ('owner' | 'vet' | 'admin')[];
  }) {
    this.logger.log(`Emitting emergency alert: ${data.alertType}`);
    this.eventEmitter.emit(PetClinicEventType.EMERGENCY_ALERT, data);
  }

  // Emit inventory low event
  emitInventoryLow(data: {
    itemId: string;
    itemName: string;
    currentStock: number;
    minThreshold: number;
    urgent: boolean;
  }) {
    this.logger.log(`Emitting inventory low alert for ${data.itemName}`);
    this.eventEmitter.emit(PetClinicEventType.INVENTORY_LOW, data);
  }
} 