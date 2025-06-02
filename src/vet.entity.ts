import { Entity, PrimaryGeneratedColumn, Column, OneToMany, Unique } from 'typeorm';
import { Appointment } from './appointment.entity';
import { TreatmentHistory } from './treatment-history.entity';

@Entity()
@Unique(['licenseNumber']) 
export class Vet {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ unique: true }) 
  licenseNumber: string;

  @Column()
  contact: string;

  @Column()
  specialization: string;

  @OneToMany(() => Appointment, (appointment) => appointment.vet)
  appointments: Appointment[];

  @OneToMany(() => TreatmentHistory, (treatment) => treatment.vet)
  treatments: TreatmentHistory[];
}