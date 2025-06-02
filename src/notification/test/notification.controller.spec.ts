// src/notifications/tests/notification.controller.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { NotificationController } from '../notification.controller';
import { NotificationService } from '../notification.service';
import { NotificationType } from '../enums/notification-type.enum';

describe('NotificationController', () => {
  let controller: NotificationController;
  let service: NotificationService;

  const userId = 'user-123';
  const notificationId = 'notif-123';
  
  const mockNotification = {
    id: notificationId,
    title: 'Test Notification',
    message: 'This is a test',
    type: NotificationType.APPOINTMENT_REMINDER,
    recipientId: userId,
    isRead: false,
    deliveredAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
    relatedEntityId: 'entity-123',
  };

  const mockRequest = {
    user: {
      id: userId,
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NotificationController],
      providers: [
        {
          provide: NotificationService,
          useValue: {
            getUserNotifications: jest.fn(),
            markAsRead: jest.fn(),
            deleteNotification: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<NotificationController>(NotificationController);
    service = module.get<NotificationService>(NotificationService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getUserNotifications', () => {
    it('should return all notifications for the authenticated user', async () => {
      jest.spyOn(service, 'getUserNotifications').mockResolvedValue([mockNotification]);

      const result = await controller.getUserNotifications(mockRequest);

      expect(service.getUserNotifications).toHaveBeenCalledWith(userId);
      expect(result).toEqual([mockNotification]);
    });
  });

  describe('markAsRead', () => {
    it('should mark a notification as read', async () => {
      const updatedNotification = { ...mockNotification, isRead: true };
      jest.spyOn(service, 'markAsRead').mockResolvedValue(updatedNotification);

      const result = await controller.markAsRead(notificationId, mockRequest);

      expect(service.markAsRead).toHaveBeenCalledWith(notificationId, userId);
      expect(result).toEqual(updatedNotification);
    });
  });

  describe('deleteNotification', () => {
    it('should delete a notification', async () => {
      jest.spyOn(service, 'deleteNotification').mockResolvedValue(undefined);

      await controller.deleteNotification(notificationId, mockRequest);

      expect(service.deleteNotification).toHaveBeenCalledWith(notificationId, userId);
    });
  });
});