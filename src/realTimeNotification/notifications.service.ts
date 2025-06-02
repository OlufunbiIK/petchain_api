import { Injectable, Logger } from '@nestjs/common';
import { NotificationsGateway } from './notifications.gateway';
import { NotificationDto, NotificationType } from './dto/notification.dto';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class NotificationsService {
  private logger = new Logger('NotificationsService');

  constructor(private notificationsGateway: NotificationsGateway) {}

  // Send vaccination due notification
  async sendVaccinationDueNotification(
    petId: string, 
    petName: string, 
    ownerId: string, 
    vaccinationType: string,
    dueDate: Date
  ) {
    const notification: NotificationDto = {
      id: uuidv4(),
      type: NotificationType.VACCINATION_DUE,
      title: 'Vaccination Due',
      message: `${petName}'s ${vaccinationType} vaccination is due on ${dueDate.toLocaleDateString()}`,
      recipientId: ownerId,
      recipientType: 'owner',
      entityId: petId,
      metadata: {
        vaccinationType,
        dueDate: dueDate.toISOString(),
      },
      createdAt: new Date(),
    };

    const delivered = this.notificationsGateway.sendToUser(
      ownerId,
      'notification',
      notification,
    );

    this.logger.log(
      `Vaccination due notification for pet ${petId} ${
        delivered ? 'delivered' : 'queued for delivery'
      } to owner ${ownerId}`,
    );

    return notification;
  }

  // Send new treatment notification
  async sendNewTreatmentNotification(
    petId: string,
    petName: string,
    ownerId: string,
    treatmentName: string,
    vetId: string,
  ) {
    const notification: NotificationDto = {
      id: uuidv4(),
      type: NotificationType.NEW_TREATMENT,
      title: 'New Treatment Added',
      message: `A new treatment (${treatmentName}) has been added for ${petName}`,
      recipientId: ownerId,
      recipientType: 'owner',
      entityId: petId,
      metadata: {
        treatmentName,
        vetId,
      },
      createdAt: new Date(),
    };

    const delivered = this.notificationsGateway.sendToUser(
      ownerId,
      'notification',
      notification,
    );

    this.logger.log(
      `New treatment notification for pet ${petId} ${
        delivered ? 'delivered' : 'queued for delivery'
      } to owner ${ownerId}`,
    );

    return notification;
  }

  // Send appointment rescheduled notification
  async sendAppointmentRescheduledNotification(
    appointmentId: string,
    ownerId: string,
    vetId: string,
    petName: string,
    oldDateTime: Date,
    newDateTime: Date,
  ) {
    // Notification for owner
    const ownerNotification: NotificationDto = {
      id: uuidv4(),
      type: NotificationType.APPOINTMENT_RESCHEDULED,
      title: 'Appointment Rescheduled',
      message: `Your appointment for ${petName} has been rescheduled from ${oldDateTime.toLocaleString()} to ${newDateTime.toLocaleString()}`,
      recipientId: ownerId,
      recipientType: 'owner',
      entityId: appointmentId,
      metadata: {
        oldDateTime: oldDateTime.toISOString(),
        newDateTime: newDateTime.toISOString(),
        vetId,
      },
      createdAt: new Date(),
    };

    // Notification for vet
    const vetNotification: NotificationDto = {
      id: uuidv4(),
      type: NotificationType.APPOINTMENT_RESCHEDULED,
      title: 'Appointment Rescheduled',
      message: `Appointment for ${petName} has been rescheduled from ${oldDateTime.toLocaleString()} to ${newDateTime.toLocaleString()}`,
      recipientId: vetId,
      recipientType: 'vet',
      entityId: appointmentId,
      metadata: {
        oldDateTime: oldDateTime.toISOString(),
        newDateTime: newDateTime.toISOString(),
        ownerId,
      },
      createdAt: new Date(),
    };

    // Send to both owner and vet
    const ownerDelivered = this.notificationsGateway.sendToUser(
      ownerId,
      'notification',
      ownerNotification,
    );

    const vetDelivered = this.notificationsGateway.sendToUser(
      vetId,
      'notification',
      vetNotification,
    );

    this.logger.log(
      `Appointment reschedule notification ${
        ownerDelivered ? 'delivered' : 'queued for delivery'
      } to owner ${ownerId} and ${
        vetDelivered ? 'delivered' : 'queued for delivery'
      } to vet ${vetId}`,
    );

    return {
      ownerNotification,
      vetNotification,
    };
  }

  // Send medication reminder notification
  async sendMedicationReminderNotification(
    petId: string,
    petName: string,
    ownerId: string,
    medicationName: string,
    dosage: string,
    reminderTime: Date,
    instructions?: string,
  ) {
    const notification: NotificationDto = {
      id: uuidv4(),
      type: NotificationType.MEDICATION_REMINDER,
      title: 'Medication Reminder',
      message: `Time to give ${petName} their ${medicationName} (${dosage})${
        instructions ? `. ${instructions}` : ''
      }`,
      recipientId: ownerId,
      recipientType: 'owner',
      entityId: petId,
      metadata: {
        medicationName,
        dosage,
        reminderTime: reminderTime.toISOString(),
        instructions,
      },
      createdAt: new Date(),
    };

    const delivered = this.notificationsGateway.sendToUser(
      ownerId,
      'notification',
      notification,
    );

    this.logger.log(
      `Medication reminder notification for pet ${petId} ${
        delivered ? 'delivered' : 'queued for delivery'
      } to owner ${ownerId}`,
    );

    return notification;
  }

  // Send test results ready notification
  async sendTestResultsReadyNotification(
    testId: string,
    petId: string,
    petName: string,
    ownerId: string,
    vetId: string,
    testType: string,
    resultSummary: string,
    resultDate: Date,
  ) {
    // Notification for owner
    const ownerNotification: NotificationDto = {
      id: uuidv4(),
      type: NotificationType.TEST_RESULTS_READY,
      title: 'Test Results Ready',
      message: `${petName}'s ${testType} test results are ready: ${resultSummary}`,
      recipientId: ownerId,
      recipientType: 'owner',
      entityId: testId,
      metadata: {
        petId,
        testType,
        resultDate: resultDate.toISOString(),
        vetId,
      },
      createdAt: new Date(),
    };

    // Notification for vet
    const vetNotification: NotificationDto = {
      id: uuidv4(),
      type: NotificationType.TEST_RESULTS_READY,
      title: 'Test Results Ready',
      message: `${petName}'s ${testType} test results are ready: ${resultSummary}`,
      recipientId: vetId,
      recipientType: 'vet',
      entityId: testId,
      metadata: {
        petId,
        testType,
        resultDate: resultDate.toISOString(),
        ownerId,
      },
      createdAt: new Date(),
    };

    // Send to both owner and vet
    const ownerDelivered = this.notificationsGateway.sendToUser(
      ownerId,
      'notification',
      ownerNotification,
    );

    const vetDelivered = this.notificationsGateway.sendToUser(
      vetId,
      'notification',
      vetNotification,
    );

    this.logger.log(
      `Test results notification ${
        ownerDelivered ? 'delivered' : 'queued for delivery'
      } to owner ${ownerId} and ${
        vetDelivered ? 'delivered' : 'queued for delivery'
      } to vet ${vetId}`,
    );

    return {
      ownerNotification,
      vetNotification,
    };
  }

  // Send emergency alert notification
  async sendEmergencyAlertNotification(
    clinicId: string,
    alertType: string,
    message: string,
    severity: 'low' | 'medium' | 'high' | 'critical',
    affectedRoles: ('owner' | 'vet' | 'admin')[],
  ) {
    const notification: NotificationDto = {
      id: uuidv4(),
      type: NotificationType.EMERGENCY_ALERT,
      title: `${severity.toUpperCase()} ALERT: ${alertType}`,
      message: message,
      recipientId: 'ALL', // Special case - will be handled differently
      recipientType: 'system',
      entityId: clinicId,
      metadata: {
        alertType,
        severity,
        affectedRoles,
        timestamp: new Date().toISOString(),
      },
      createdAt: new Date(),
    };

    let delivered = false;

    // Send to all affected role groups
    for (const role of affectedRoles) {
      if (role === 'owner' || role === 'vet') {
        this.notificationsGateway.sendToUserType(role, 'emergency_alert', notification);
        delivered = true;
      }
    }

    this.logger.log(
      `Emergency alert notification ${
        delivered ? 'broadcast' : 'failed to broadcast'
      } to affected roles: ${affectedRoles.join(', ')}`,
    );

    return notification;
  }

  // Send inventory low notification
  async sendInventoryLowNotification(
    itemId: string,
    itemName: string,
    currentStock: number,
    minThreshold: number,
    urgent: boolean,
  ) {
    const notification: NotificationDto = {
      id: uuidv4(),
      type: NotificationType.INVENTORY_LOW,
      title: urgent ? 'URGENT: Inventory Critical' : 'Inventory Low',
      message: `${itemName} stock is low (${currentStock} remaining, threshold: ${minThreshold})`,
      recipientId: 'STAFF', // Special case for staff notifications
      recipientType: 'vet', // Assuming vets handle inventory - adjust as needed
      entityId: itemId,
      metadata: {
        itemName,
        currentStock,
        minThreshold,
        urgent,
        timestamp: new Date().toISOString(),
      },
      createdAt: new Date(),
    };

    // Send to all vet staff
    const delivered = this.notificationsGateway.sendToUserType(
      'vet',
      urgent ? 'urgent_inventory' : 'notification',
      notification,
    );

    this.logger.log(
      `Inventory low notification for ${itemName} ${
        delivered ? 'broadcast' : 'failed to broadcast'
      } to vet staff`,
    );

    return notification;
  }
}
