import {
    Controller,
    Get,
    Post,
    Patch,
    Put,
    Param,
    Body,
    Query,
    ParseIntPipe,
    UsePipes,
    ValidationPipe,
    NotFoundException,
  } from '@nestjs/common';
  import { ReviewService } from './review.service';
  import { ReviewFilterDto } from './dto/review-filter.dto';
  import { CreateReviewDto } from './dto/create-review.dto';
  
  @Controller('reviews')
  export class ReviewController {
    constructor(private readonly reviewService: ReviewService) {}
  
    // Submit a review
    @Post()
    @UsePipes(ValidationPipe)
    async createReview(@Body() createReviewDto: CreateReviewDto) {
      // This should call a method like reviewService.createReview(createReviewDto)
      throw new NotFoundException('createReview method not implemented yet.');
    }
  
    // Get all approved reviews (with optional filters)
    @Get()
    getApprovedReviews(@Query(ValidationPipe) filterDto: ReviewFilterDto) {
      return this.reviewService.getApprovedReviews(filterDto);
    }
  
    // Approve a review (moderator/admin action)
    @Put(':id/approve')
    approveReview(@Param('id', ParseIntPipe) id: number) {
      return this.reviewService.approveReview(id);
    }
  
    // Upvote helpfulness
    @Patch(':id/upvote')
    upvoteHelpfulness(@Param('id', ParseIntPipe) id: number) {
      return this.reviewService.upvoteHelpfulness(id);
    }
  
    // Optional: Get a single review by ID
    @Get(':id')
    async getReviewById(@Param('id', ParseIntPipe) id: number) {
      const review = await this.reviewService.getReviewById?.(id);
      if (!review) throw new NotFoundException('Review not found');
      return review;
    }
  }
  