import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { NotificationService } from './notification.service';
import { NotificationStatus } from './notification.entity';

@Injectable()
export class NotificationSchedulerService {
  private readonly logger = new Logger(NotificationSchedulerService.name);

  constructor(private readonly notificationService: NotificationService) {}

  // CronExpression
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleDailyNotifications() {
    this.logger.log('Starting daily notification scan...');
    
    try {
      const pendingNotifications = await this.notificationService.getPendingNotifications();
      
      for (const notification of pendingNotifications) {
        if (notification.scheduledDate && 
            notification.scheduledDate <= new Date() && 
            notification.status === NotificationStatus.PENDING) {
          
          // Here you can add logic to send notifications via email/SMS
          await this.notificationService.markAsSent(notification);
          this.logger.log(`Processed notification ${notification.id} for ${notification.recipientId}`);
        }
      }
      
      this.logger.log('Daily notification scan completed');
    } catch (error) {
      this.logger.error('Error in daily notification scan:', error);
    }
  }
} 