import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Owner } from './owner.entity';
import { OwnerController } from './owner.controller';
import { OwnerService } from './owner.service';
import { PetModule } from './pet.module';
import { Pet } from './pet.entity';
import { ReviewController } from './review.controller';
import { ReviewService } from './review.service';
import { Review } from './review.entity';
import { ReviewResponse } from './review-response.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ReviewResponse, Review])],
  controllers: [ReviewController],
  providers: [ReviewService],
  exports: [ReviewService],
})
export class ReviewModule {}
