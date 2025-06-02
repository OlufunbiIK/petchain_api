import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';
import { Pet } from './pet.entity';
import { Vet } from './vet.entity';

export enum TreatmentType {
  VACCINATION = 'vaccination',
  SURGERY = 'surgery',
  CHECKUP = 'checkup',
  MEDICATION = 'medication',
  EMERGENCY = 'emergency',
  OTHER = 'other',
}

@Entity()
export class TreatmentHistory {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  description: string;

  @Column({
    type: 'enum',
    enum: TreatmentType,
    default: TreatmentType.OTHER,
  })
  treatmentType: TreatmentType;

  @Column({ type: 'date' })
  date: Date;

  @Column({ nullable: true, type: 'text' })
  notes: string;

  @ManyToOne(() => Vet, (vet) => vet.treatments)
  vet: Vet;

  @Column()
  vetId: number;

  @ManyToOne(() => Pet, (pet) => pet.treatments)
  pet: Pet;

  @Column()
  petId: number;

  @CreateDateColumn()
  createdAt: Date;
}
