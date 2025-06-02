import { Controller, Get, Post, Body, Param, Put, Delete, UseGuards } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { Notification } from './notification.entity';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { User } from '../decorators/user.decorator';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get()
  async getUserNotifications(@User('id') userId: number): Promise<Notification[]> {
    return this.notificationService.getUserNotifications(userId);
  }

  @Put(':id/read')
  async markAsRead(@Param('id') id: number): Promise<Notification> {
    const notification = await this.notificationService.getNotificationById(id);
    return this.notificationService.markAsRead(notification);
  }

  @Delete(':id')
  async deleteNotification(@Param('id') id: number): Promise<void> {
    return this.notificationService.deleteNotification(id);
  }

  @Get('pending')
  async getPendingNotifications(): Promise<Notification[]> {
    return this.notificationService.getPendingNotifications();
  }
} 