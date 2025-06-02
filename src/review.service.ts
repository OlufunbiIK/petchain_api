import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Review } from "./review.entity";
import { ReviewFilterDto } from "./dto/review-filter.dto";
import { CreateReviewDto } from "./dto/create-review.dto";

@Injectable()
export class ReviewService {
  constructor(
    @InjectRepository(Review)
    private readonly reviewRepo: Repository<Review>,
  ) {}

  // Submit a new review
  async createReview(createReviewDto: CreateReviewDto) {
    const { content, rating, productId, serviceId } = createReviewDto;

    const review = this.reviewRepo.create({
      content,
      rating,
      productId,
      serviceId,
      approved: false, // pending moderation
      helpfulVotes: 0,
    });

    return this.reviewRepo.save(review);
  }

  // Approve a review (admin/mod)
  async approveReview(id: number) {
    const review = await this.reviewRepo.findOneBy({ id });
    if (!review) throw new NotFoundException('Review not found');

    review.approved = true;
    return this.reviewRepo.save(review);
  }

  // Fetch approved reviews, with optional filters
  async getApprovedReviews(filterDto: ReviewFilterDto) {
    const query = this.reviewRepo.createQueryBuilder('review');

    query.where('review.approved = :approved', { approved: true });

    if (filterDto.minRating) {
      query.andWhere('review.rating >= :minRating', {
        minRating: filterDto.minRating,
      });
    }

    if (filterDto.productId) {
      query.andWhere('review.productId = :productId', {
        productId: filterDto.productId,
      });
    }

    if (filterDto.serviceId) {
      query.andWhere('review.serviceId = :serviceId', {
        serviceId: filterDto.serviceId,
      });
    }

    return query.getMany();
  }

  // Upvote helpfulness
  async upvoteHelpfulness(reviewId: number) {
    const review = await this.reviewRepo.findOneBy({ id: reviewId });
    if (!review) throw new NotFoundException('Review not found');

    review.helpfulVotes += 1;
    return this.reviewRepo.save(review);
  }

  // Optional: Get a review by ID
  async getReviewById(id: number) {
    const review = await this.reviewRepo.findOneBy({ id });
    return review;
  }
}
