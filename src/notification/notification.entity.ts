import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Pet } from '../pet.entity';
import { Owner } from '../owner.entity';

// NotificationType
export enum NotificationType {
  APPOINTMENT_REMINDER = 'APPOINTMENT_REMINDER',
  VACCINATION_ALERT = 'VACCINATION_ALERT',
  TREATMENT_FOLLOW_UP = 'TREATMENT_FOLLOW_UP'
}


// NotificationStatus
export enum NotificationStatus {
  PENDING = 'PENDING',
  SENT = 'SENT',
  READ = 'READ'
}

@Entity()
export class Notification {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'enum',
    enum: NotificationType,
    default: NotificationType.APPOINTMENT_REMINDER
  })
  type: NotificationType;

  @Column({
    type: 'enum',
    enum: NotificationStatus,
    default: NotificationStatus.PENDING
  })
  status: NotificationStatus;

  @Column()
  title: string;

  @Column('text')
  message: string;

  @Column({ nullable: true })
  scheduledDate: Date;

  @Column({ default: false })
  isRead: boolean;

  @Column({ nullable: true })
  deliveredAt: Date;

  @ManyToOne(() => Pet, pet => pet.notifications)
  pet: Pet;

  @ManyToOne(() => Owner, owner => owner.notifications)
  owner: Owner;

  @Column()
  recipientId: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
} 