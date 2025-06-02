import { NotificationType } from '../enums/notification-type.enum';

export class NotificationResponseDto {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  recipientId: string;
  isRead: boolean;
  deliveredAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  relatedEntityId?: string;
}