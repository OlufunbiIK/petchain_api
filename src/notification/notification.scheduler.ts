// src/notifications/notification.scheduler.ts
import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { NotificationService } from './notification.service';

@Injectable()
export class NotificationScheduler {
  private readonly logger = new Logger(NotificationScheduler.name);
  
  constructor(private readonly notificationService: NotificationService) {}
  
  @Cron(CronExpression.EVERY_DAY_AT_8AM)
  async handleAppointmentReminders() {
    this.logger.log('Running appointment reminder check');
    await this.notificationService.checkAppointmentReminders();
  }
  
  @Cron(CronExpression.EVERY_DAY_AT_9AM)
  async handleVaccinationReminders() {
    this.logger.log('Running vaccination reminder check');
    await this.notificationService.checkVaccinationReminders();
  }
  
  @Cron(CronExpression.EVERY_DAY_AT_10AM)
  async handleTreatmentFollowups() {
    this.logger.log('Running treatment follow-up check');
    await this.notificationService.checkTreatmentFollowups();
  }
}