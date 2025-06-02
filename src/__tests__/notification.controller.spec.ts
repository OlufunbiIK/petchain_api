import { Test, TestingModule } from '@nestjs/testing';
import { NotificationController } from '../notification.controller';
import { NotificationService } from '../notification.service';
import { Notification } from '../notification.entity';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

describe('NotificationController', () => {
  let controller: NotificationController;
  let notificationService: NotificationService;

  const mockNotificationService = {
    getUserNotifications: jest.fn(),
    getNotificationById: jest.fn(),
    markAsRead: jest.fn(),
    deleteNotification: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NotificationController],
      providers: [
        {
          provide: NotificationService,
          useValue: mockNotificationService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<NotificationController>(NotificationController);
    notificationService = module.get<NotificationService>(NotificationService);
  });

  describe('getUserNotifications', () => {
    it('should return user notifications', async () => {
      const userId = 1;
      const expectedNotifications = [
        { id: 1, recipientId: userId },
        { id: 2, recipientId: userId },
      ] as Notification[];

      mockNotificationService.getUserNotifications.mockResolvedValue(expectedNotifications);

      const result = await controller.getUserNotifications(userId);

      expect(result).toEqual(expectedNotifications);
      expect(mockNotificationService.getUserNotifications).toHaveBeenCalledWith(userId);
    });
  });

  describe('markAsRead', () => {
    it('should mark a notification as read', async () => {
      const notificationId = 1;
      const notification = { id: notificationId, isRead: false } as Notification;
      const updatedNotification = { ...notification, isRead: true };

      mockNotificationService.getNotificationById.mockResolvedValue(notification);
      mockNotificationService.markAsRead.mockResolvedValue(updatedNotification);

      const result = await controller.markAsRead(notificationId);

      expect(result).toEqual(updatedNotification);
      expect(mockNotificationService.getNotificationById).toHaveBeenCalledWith(notificationId);
      expect(mockNotificationService.markAsRead).toHaveBeenCalledWith(notification);
    });
  });

  describe('deleteNotification', () => {
    it('should delete a notification', async () => {
      const notificationId = 1;

      mockNotificationService.deleteNotification.mockResolvedValue(undefined);

      await controller.deleteNotification(notificationId);

      expect(mockNotificationService.deleteNotification).toHaveBeenCalledWith(notificationId);
    });
  });
}); 