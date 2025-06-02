// src/notifications/tests/notification.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotificationService } from '../notification.service';
import { Notification } from '../entities/notification.entity';
import { Appointment } from '../../appointments/entities/appointment.entity';
import { Vaccination } from '../../vaccinations/entities/vaccination.entity';
import { Treatment } from '../../treatments/entities/treatment.entity';
import { NotificationType } from '../enums/notification-type.enum';
import { NotFoundException } from '@nestjs/common';
import { CreateNotificationDto } from '../dto/create-notification.dto';

type MockRepository<T = any> = Partial<Record<keyof Repository<T>, jest.Mock>>;

const createMockRepository = <T>(): MockRepository<T> => ({
  find: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  remove: jest.fn(),
});

describe('NotificationService', () => {
  let service: NotificationService;
  let notificationRepository: MockRepository<Notification>;
  let appointmentRepository: MockRepository<Appointment>;
  let vaccinationRepository: MockRepository<Vaccination>;
  let treatmentRepository: MockRepository<Treatment>;

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

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationService,
        {
          provide: getRepositoryToken(Notification),
          useValue: createMockRepository<Notification>(),
        },
        {
          provide: getRepositoryToken(Appointment),
          useValue: createMockRepository<Appointment>(),
        },
        {
          provide: getRepositoryToken(Vaccination),
          useValue: createMockRepository<Vaccination>(),
        },
        {
          provide: getRepositoryToken(Treatment),
          useValue: createMockRepository<Treatment>(),
        },
      ],
    }).compile();

    service = module.get<NotificationService>(NotificationService);
    notificationRepository = module.get<MockRepository<Notification>>(
      getRepositoryToken(Notification),
    );
    appointmentRepository = module.get<MockRepository<Appointment>>(
      getRepositoryToken(Appointment),
    );
    vaccinationRepository = module.get<MockRepository<Vaccination>>(
      getRepositoryToken(Vaccination),
    );
    treatmentRepository = module.get<MockRepository<Treatment>>(
      getRepositoryToken(Treatment),
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createNotification', () => {
    it('should create and return a notification', async () => {
      const createDto: CreateNotificationDto = {
        title: 'Test Notification',
        message: 'This is a test',
        type: NotificationType.APPOINTMENT_REMINDER,
        recipientId: userId,
        relatedEntityId: 'entity-123',
      };

      notificationRepository.create.mockReturnValue(mockNotification);
      notificationRepository.save.mockResolvedValue(mockNotification);

      const result = await service.createNotification(createDto);

      expect(notificationRepository.create).toHaveBeenCalledWith({
        ...createDto,
        deliveredAt: expect.any(Date),
      });
      expect(notificationRepository.save).toHaveBeenCalledWith(mockNotification);
      expect(result).toEqual(mockNotification);
    });
  });

  describe('getUserNotifications', () => {
    it('should return all notifications for a user', async () => {
      notificationRepository.find.mockResolvedValue([mockNotification]);

      const result = await service.getUserNotifications(userId);

      expect(notificationRepository.find).toHaveBeenCalledWith({
        where: { recipientId: userId },
        order: { createdAt: 'DESC' },
      });
      expect(result).toEqual([mockNotification]);
    });
  });

  describe('markAsRead', () => {
    it('should mark a notification as read', async () => {
      notificationRepository.findOne.mockResolvedValue(mockNotification);
      const updatedNotification = { ...mockNotification, isRead: true };
      notificationRepository.save.mockResolvedValue(updatedNotification);

      const result = await service.markAsRead(notificationId, userId);

      expect(notificationRepository.findOne).toHaveBeenCalledWith({
        where: { id: notificationId, recipientId: userId },
      });
      expect(notificationRepository.save).toHaveBeenCalledWith({
        ...mockNotification,
        isRead: true,
      });
      expect(result).toEqual(updatedNotification);
    });

    it('should throw NotFoundException if notification not found', async () => {
      notificationRepository.findOne.mockResolvedValue(null);

      await expect(service.markAsRead(notificationId, userId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('deleteNotification', () => {
    it('should delete a notification', async () => {
      notificationRepository.findOne.mockResolvedValue(mockNotification);

      await service.deleteNotification(notificationId, userId);

      expect(notificationRepository.findOne).toHaveBeenCalledWith({
        where: { id: notificationId, recipientId: userId },
      });
      expect(notificationRepository.remove).toHaveBeenCalledWith(mockNotification);
    });

    it('should throw NotFoundException if notification not found', async () => {
      notificationRepository.findOne.mockResolvedValue(null);

      await expect(service.deleteNotification(notificationId, userId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('checkAppointmentReminders', () => {
    it('should create notifications for upcoming appointments', async () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      const mockAppointment = {
        id: 'appointment-123',
        appointmentDate: tomorrow,
        pet: {
          name: 'Fluffy',
          owner: {
            id: userId,
            firstName: 'John',
            lastName: 'Doe',
          },
        },
        vetId: 'vet-123',
      };

      appointmentRepository.find.mockResolvedValue([mockAppointment]);
      notificationRepository.findOne.mockResolvedValue(null);
      notificationRepository.create.mockReturnValue(mockNotification);
      notificationRepository.save.mockResolvedValue(mockNotification);
      
      await service.checkAppointmentReminders();
      
      // Should create 2 notifications (one for owner, one for vet)
      expect(notificationRepository.create).toHaveBeenCalledTimes(2);
      expect(notificationRepository.save).toHaveBeenCalledTimes(2);
    });
    
    it('should not create duplicate notifications', async () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      const mockAppointment = {
        id: 'appointment-123',
        appointmentDate: tomorrow,
        pet: {
          name: 'Fluffy',
          owner: {
            id: userId,
            firstName: 'John',
            lastName: 'Doe',
          },
        },
      };

      appointmentRepository.find.mockResolvedValue([mockAppointment]);
      notificationRepository.findOne.mockResolvedValue(mockNotification); // Existing notification
      
      await service.checkAppointmentReminders();
      
      // Should not create any notifications
      expect(notificationRepository.create).not.toHaveBeenCalled();
      expect(notificationRepository.save).not.toHaveBeenCalled();
    });
  });
});