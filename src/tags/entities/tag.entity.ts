/**
 * NestJS Tag Management System
 * 
 * This solution implements a tag categorization system for treatments and vaccines
 * with complete CRUD operations and filtering capabilities.
 */

// ----- TAG ENTITY -----
// src/tags/entities/tag.entity.ts

import { Column, Entity, ManyToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Treatment } from '../../treatments/entities/treatment.entity';
import { Vaccination } from '../../vaccinations/entities/vaccination.entity';

export enum TagType {
  TREATMENT = 'treatment',
  VACCINE = 'vaccine',
}

@Entity('tags')
export class Tag {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  name: string;

  @Column({
    type: 'enum',
    enum: TagType,
    default: TagType.TREATMENT,
  })
  type: TagType;

  @ManyToMany(() => Treatment, (treatment) => treatment.tags)
  treatments: Treatment[];

  @ManyToMany(() => Vaccination, (vaccination) => vaccination.tags)
  vaccinations: Vaccination[];
}
