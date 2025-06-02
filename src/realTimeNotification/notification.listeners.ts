
  import { Injectable, Logger } from '@nestjs/common';
  import { OnEvent } from '@nestjs/event-emitter';
  import { NotificationsService } from './notifications.service';
  import { PetClinicEventType } from './events/events.service';
  
  @Injectable()
  export class NotificationListeners {
    private logger = new Logger('NotificationListeners');
  
    constructor(private notificationsService: NotificationsService) {}
  
    @OnEvent(PetClinicEventType.VACCINATION_DUE)
    async handleVaccinationDueEvent(payload: {
      petId: string;
      petName: string;
      ownerId: string;
      vaccinationType: string;
      dueDate: Date;
    }) {
      this.logger.log(
        `Handling vaccination due event for pet ${payload.petId}`,
      );
      await this.notificationsService.sendVaccinationDueNotification(
        payload.petId,
        payload.petName,
        payload.ownerId,
        payload.vaccinationType,
        payload.dueDate,
      );
    }
  
    @OnEvent(PetClinicEventType.TREATMENT_ADDED)
    async handleTreatmentAddedEvent(payload: {
      petId: string;
      petName: string;
      ownerId: string;
      treatmentName: string;
      vetId: string;
    }) {
      this.logger.log(
        `Handling treatment added event for pet ${payload.petId}`,
      );
      await this.notificationsService.sendNewTreatmentNotification(
        payload.petId,
        payload.petName,
        payload.ownerId,
        payload.treatmentName,
        payload.vetId,
      );
    }
  
    @OnEvent(PetClinicEventType.APPOINTMENT_RESCHEDULED)
    async handleAppointmentRescheduledEvent(payload: {
      appointmentId: string;
      ownerId: string;
      vetId: string;
      petName: string;
      oldDateTime: Date;
      newDateTime: Date;
    }) {
      this.logger.log(
        `Handling appointment rescheduled event for appointment ${payload.appointmentId}`,
      );
      await this.notificationsService.sendAppointmentRescheduledNotification(
        payload.appointmentId,
        payload.ownerId,
        payload.vetId,
        payload.petName,
        payload.oldDateTime,
        payload.newDateTime,
      );
    }
  
    @OnEvent(PetClinicEventType.MEDICATION_REMINDER)
    async handleMedicationReminderEvent(payload: {
      petId: string;
      petName: string;
      ownerId: string;
      medicationName: string;
      dosage: string;
      reminderTime: Date;
      instructions?: string;
    }) {
      this.logger.log(`Handling medication reminder event for pet ${payload.petId}`);
      await this.notificationsService.sendMedicationReminderNotification(
        payload.petId,
        payload.petName,
        payload.ownerId,
        payload.medicationName,
        payload.dosage,
        payload.reminderTime,
        payload.instructions,
      );
    }
  
    @OnEvent(PetClinicEventType.TEST_RESULTS_READY)
    async handleTestResultsReadyEvent(payload: {
      testId: string;
      petId: string;
      petName: string;
      ownerId: string;
      vetId: string;
      testType: string;
      resultSummary: string;
      resultDate: Date;
    }) {
      this.logger.log(`Handling test results ready event for test ${payload.testId}`);
      await this.notificationsService.sendTestResultsReadyNotification(
        payload.testId,
        payload.petId,
        payload.petName,
        payload.ownerId,
        payload.vetId,
        payload.testType,
        payload.resultSummary,
        payload.resultDate,
      );
    }
  
    @OnEvent(PetClinicEventType.EMERGENCY_ALERT)
    async handleEmergencyAlertEvent(payload: {
      clinicId: string;
      alertType: string;
      message: string;
      severity: 'low' | 'medium' | 'high' | 'critical';
      affectedRoles: ('owner' | 'vet' | 'admin')[];
    }) {
      this.logger.log(`Handling emergency alert event: ${payload.alertType}`);
      await this.notificationsService.sendEmergencyAlertNotification(
        payload.clinicId,
        payload.alertType,
        payload.message,
        payload.severity,
        payload.affectedRoles,
      );
    }
  
    @OnEvent(PetClinicEventType.INVENTORY_LOW)
    async handleInventoryLowEvent(payload: {
      itemId: string;
      itemName: string;
      currentStock: number;
      minThreshold: number;
      urgent: boolean;
    }) {
      this.logger.log(`Handling inventory low event for ${payload.itemName}`);
      await this.notificationsService.sendInventoryLowNotification(
        payload.itemId,
        payload.itemName,
        payload.currentStock,
        payload.minThreshold,
        payload.urgent,
      );
    }
  }
  