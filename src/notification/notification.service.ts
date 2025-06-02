import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification, NotificationType, NotificationStatus } from './notification.entity';
import { Pet } from '../pet.entity';
import { Owner } from '../owner.entity';
import { NotificationGateway } from './notification.gateway';

@Injectable()
export class NotificationService {
  constructor(
    @InjectRepository(Notification)
    private notificationRepository: Repository<Notification>,
    private readonly notificationGateway: NotificationGateway,
  ) {}

  async createAppointmentReminder(pet: Pet, owner: Owner, appointmentDate: Date): Promise<Notification> {
    const notification = this.notificationRepository.create({
      type: NotificationType.APPOINTMENT_REMINDER,
      title: 'Upcoming Appointment',
      message: `Reminder: ${pet.name} has an appointment scheduled for ${appointmentDate.toLocaleDateString()}`,
      scheduledDate: appointmentDate,
      pet,
      owner,
      recipientId: owner.id,
      status: NotificationStatus.PENDING,
      isRead: false
    });

    const savedNotification = await this.notificationRepository.save(notification);
    await this.notificationGateway.sendNotificationToUser(owner.id, savedNotification);
    return savedNotification;
  }

  async createVaccinationAlert(pet: Pet, owner: Owner, dueDate: Date): Promise<Notification> {
    const notification = this.notificationRepository.create({
      type: NotificationType.VACCINATION_ALERT,
      title: 'Vaccination Due',
      message: `Reminder: ${pet.name} is due for vaccination on ${dueDate.toLocaleDateString()}`,
      scheduledDate: dueDate,
      pet,
      owner,
      recipientId: owner.id,
      status: NotificationStatus.PENDING,
      isRead: false
    });

    const savedNotification = await this.notificationRepository.save(notification);
    await this.notificationGateway.sendNotificationToUser(owner.id, savedNotification);
    return savedNotification;
  }

  async createTreatmentFollowUp(pet: Pet, owner: Owner, followUpDate: Date): Promise<Notification> {
    const notification = this.notificationRepository.create({
      type: NotificationType.TREATMENT_FOLLOW_UP,
      title: 'Treatment Follow-up',
      message: `Reminder: ${pet.name} has a treatment follow-up scheduled for ${followUpDate.toLocaleDateString()}`,
      scheduledDate: followUpDate,
      pet,
      owner,
      recipientId: owner.id,
      status: NotificationStatus.PENDING,
      isRead: false
    });

    const savedNotification = await this.notificationRepository.save(notification);
    await this.notificationGateway.sendNotificationToUser(owner.id, savedNotification);
    return savedNotification;
  }

  async getPendingNotifications(): Promise<Notification[]> {
    return this.notificationRepository.find({
      where: { status: NotificationStatus.PENDING },
      relations: ['pet', 'owner'],
    });
  }

  async markAsSent(notification: Notification): Promise<Notification> {
    notification.status = NotificationStatus.SENT;
    notification.deliveredAt = new Date();
    const updatedNotification = await this.notificationRepository.save(notification);
    await this.notificationGateway.sendNotificationToUser(notification.recipientId, updatedNotification);
    return updatedNotification;
  }

  async markAsRead(notification: Notification): Promise<Notification> {
    notification.isRead = true;
    const updatedNotification = await this.notificationRepository.save(notification);
    await this.notificationGateway.sendNotificationToUser(notification.recipientId, updatedNotification);
    return updatedNotification;
  }

  async getNotificationById(id: number): Promise<Notification> {
    const notification = await this.notificationRepository.findOne({ where: { id } });
    if (!notification) {
      throw new NotFoundException(`Notification with ID ${id} not found`);
    }
    return notification;
  }

  async getUserNotifications(userId: number): Promise<Notification[]> {
    return this.notificationRepository.find({
      where: { recipientId: userId },
      relations: ['pet'],
      order: { createdAt: 'DESC' },
    });
  }

  async deleteNotification(id: number): Promise<void> {
    const result = await this.notificationRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Notification with ID ${id} not found`);
    }
  }
} 