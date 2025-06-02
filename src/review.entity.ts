import {
  Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Owner } from './owner.entity';
import { ReviewResponse } from './review-response.entity';

@Entity()
export class Review {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int', width: 1 })
  rating: number;

  @Column({ type: 'text' })
  comment: string;

  @Column({ default: false })
  approved: boolean;

  @Column({ default: 0 })
  helpfulVotes: number;

  @OneToMany(() => ReviewResponse, (response) => response.review, { cascade: true })
  responses: ReviewResponse[];

  @Column('text') 
  content: string;

  @Column({ nullable: false })
  productId: number;

  @Column({ nullable: false }) 
  serviceId: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
