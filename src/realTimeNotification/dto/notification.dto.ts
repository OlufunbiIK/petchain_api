export enum NotificationType {
  VACCINATION_DUE = 'vaccination_due',
  NEW_TREATMENT = 'new_treatment',
  APPOINTMENT_SCHEDULED = 'appointment_scheduled',
  APPOINTMENT_RESCHEDULED = 'appointment_rescheduled',
  APPOINTMENT_CANCELLED = 'appointment_cancelled',
  MEDICATION_REMINDER = 'medication_reminder',
  TEST_RESULTS_READY = 'test_results_ready',
  EMERGENCY_ALERT = 'emergency_alert',
  INVENTORY_LOW = 'inventory_low',
}

export class NotificationDto {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  recipientId: string;
  recipientType: 'owner' | 'vet' | 'system';
  entityId?: string; // ID of related entity (pet, appointment, etc.)
  metadata?: Record<string, any>;
  createdAt: Date;
} 