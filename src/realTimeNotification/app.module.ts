import { Module } from '@nestjs/common';
import { EventsModule } from './events/events.module';
import { NotificationsModule } from './notifications.module';
import { NotificationListeners } from './notification.listeners';

@Module({
  imports: [
    EventsModule,
    NotificationsModule,
    // Other modules...
  ],
  providers: [NotificationListeners],
})
export class NotificationsAppModule {} 