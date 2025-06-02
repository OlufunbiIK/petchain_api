import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { Pet } from './pet.entity';
import { User } from './user.entity';
import { Notification } from './notification.entity';
import { Appointment } from './appointment.entity';

@Entity()
export class Owner {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => User, (user) => user.ownerProfile)
  @JoinColumn()
  user: User;

  @Column()
  fullName: string;

  @Column()
  phone: string;

  @Column()
  email: string;

  @Column()
  address: string;

  @OneToMany(() => Pet, (pet) => pet.owner)
  pets: Pet[];

  @OneToMany(() => Notification, (notification) => notification.owner)
  notifications: Notification[];

  @OneToMany(() => Appointment, (appointment) => appointment.owner)
  appointments: Appointment[];

}
