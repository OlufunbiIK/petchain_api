// ----- TREATMENT ENTITY UPDATES -----
// src/treatments/entities/treatment.entity.ts

import { 
  Column, 
  Entity, 
  JoinTable, 
  ManyToMany, 
  PrimaryGeneratedColumn 
} from 'typeorm';
import { Tag } from '../../tags/entities/tag.entity';

@Entity('treatments')
export class Treatment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  description: string;

  // Other existing fields...

  @ManyToMany(() => Tag, (tag) => tag.treatments, { cascade: true })
  @JoinTable({
    name: 'treatment_tags',
    joinColumn: { name: 'treatment_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'tag_id', referencedColumnName: 'id' },
  })
  tags: Tag[];
}
