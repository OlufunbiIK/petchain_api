import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Pet } from './pet.entity';
import { Vet } from './vet.entity';

@Entity()
export class Vaccination {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  vaccineName: string;

  @Column({ type: 'timestamp' })
  dateAdministered: Date;

  @Column({ type: 'timestamp' })
  nextDueDate: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Pet, (pet) => pet.vaccinations, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'petId' })
  pet: Pet;

  @Column()
  petId: number;

  @ManyToOne(() => Vet, (vet) => vet.vaccinations, {
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'vetId' })
  vet: Vet;

  @Column({ nullable: true })
  vetId: number;

  @Column()
  expirationDate: Date;

  @Column({ nullable: true })
  notes: string;
}
