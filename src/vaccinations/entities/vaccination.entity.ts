// ----- VACCINATION ENTITY UPDATES -----
// src/vaccinations/entities/vaccination.entity.ts

import { 
  Column, 
  Entity, 
  JoinTable, 
  ManyToMany, 
  PrimaryGeneratedColumn 
} from 'typeorm';
import { Tag } from '../../tags/entities/tag.entity';

@Entity('vaccinations')
export class Vaccination {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  description: string;

  // Other existing fields...

  @ManyToMany(() => Tag, (tag) => tag.vaccinations, { cascade: true })
  @JoinTable({
    name: 'vaccination_tags',
    joinColumn: { name: 'vaccination_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'tag_id', referencedColumnName: 'id' },
  })
  tags: Tag[];
}
