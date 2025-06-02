import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotificationService } from '../notification.service';
import { Notification, NotificationType, NotificationStatus } from '../notification.entity';
import { Pet } from '../pet.entity';
import { Owner } from '../owner.entity';
import { NotFoundException } from '@nestjs/common';

describe('NotificationService', () => {
  let service: NotificationService;
  let notificationRepository: Repository<Notification>;

  const mockNotificationRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationService,
        {
          provide: getRepositoryToken(Notification),
          useValue: mockNotificationRepository,
        },
      ],
    }).compile();

    service = module.get<NotificationService>(NotificationService);
    notificationRepository = module.get<Repository<Notification>>(getRepositoryToken(Notification));
  });

  describe('createAppointmentReminder', () => {
    it('should create an appointment reminder notification', async () => {
      const pet = { id: 1, name: 'Fluffy' } as Pet;
      const owner = { id: 1 } as Owner;
      const appointmentDate = new Date();

      const expectedNotification = {
        type: NotificationType.APPOINTMENT_REMINDER,
        title: 'Upcoming Appointment',
        message: `Reminder: Fluffy has an appointment scheduled for ${appointmentDate.toLocaleDateString()}`,
        scheduledDate: appointmentDate,
        pet,
        owner,
        recipientId: 1,
        status: NotificationStatus.PENDING,
        isRead: false,
      };

      mockNotificationRepository.create.mockReturnValue(expectedNotification);
      mockNotificationRepository.save.mockResolvedValue(expectedNotification);

      const result = await service.createAppointmentReminder(pet, owner, appointmentDate);

      expect(result).toEqual(expectedNotification);
      expect(mockNotificationRepository.create).toHaveBeenCalledWith(expectedNotification);
      expect(mockNotificationRepository.save).toHaveBeenCalledWith(expectedNotification);
    });
  });

  describe('getUserNotifications', () => {
    it('should return notifications for a user', async () => {
      const userId = 1;
      const expectedNotifications = [
        { id: 1, recipientId: userId },
        { id: 2, recipientId: userId },
      ];

      mockNotificationRepository.find.mockResolvedValue(expectedNotifications);

      const result = await service.getUserNotifications(userId);

      expect(result).toEqual(expectedNotifications);
      expect(mockNotificationRepository.find).toHaveBeenCalledWith({
        where: { recipientId: userId },
        relations: ['pet'],
        order: { createdAt: 'DESC' },
      });
    });
  });

  describe('markAsRead', () => {
    it('should mark a notification as read', async () => {
      const notification = { id: 1, isRead: false } as Notification;
      const updatedNotification = { ...notification, isRead: true };

      mockNotificationRepository.save.mockResolvedValue(updatedNotification);

      const result = await service.markAsRead(notification);

      expect(result).toEqual(updatedNotification);
      expect(result.isRead).toBe(true);
    });
  });

  describe('deleteNotification', () => {
    it('should delete a notification', async () => {
      const notificationId = 1;
      mockNotificationRepository.delete.mockResolvedValue({ affected: 1 });

      await service.deleteNotification(notificationId);

      expect(mockNotificationRepository.delete).toHaveBeenCalledWith(notificationId);
    });

    it('should throw NotFoundException if notification not found', async () => {
      const notificationId = 1;
      mockNotificationRepository.delete.mockResolvedValue({ affected: 0 });

      await expect(service.deleteNotification(notificationId)).rejects.toThrow(NotFoundException);
    });
  });
}); 