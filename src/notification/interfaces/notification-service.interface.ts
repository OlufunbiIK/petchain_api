// src/notifications/interfaces/notification-service.interface.ts
import { CreateNotificationDto } from '../dto/create-notification.dto';
import { NotificationResponseDto } from '../dto/notification-response.dto';

export interface INotificationService {
  createNotification(createNotificationDto: CreateNotificationDto): Promise<NotificationResponseDto>;
  getUserNotifications(userId: string): Promise<NotificationResponseDto[]>;
  markAsRead(id: string, userId: string): Promise<NotificationResponseDto>;
  deleteNotification(id: string, userId: string): Promise<void>;
  checkAppointmentReminders(): Promise<void>;
  checkVaccinationReminders(): Promise<void>;
  checkTreatmentFollowups(): Promise<void>;
}