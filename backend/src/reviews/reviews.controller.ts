import { Body, Controller, Get, Param, Post, UseGuards } from "@nestjs/common";
import { AuthUser } from "../auth/types/auth-user.type";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { CreateReviewDto } from "./dto/create-review.dto";
import { ReviewsService } from "./reviews.service";

@Controller("products/:productId/reviews")
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Get()
  getReviews(@Param("productId") productId: string) {
    return this.reviewsService.getReviewsByProduct(productId);
  }

  @Get("can-review")
  @UseGuards(JwtAuthGuard)
  canReview(
    @Param("productId") productId: string,
    @CurrentUser() user: AuthUser,
  ) {
    return this.reviewsService.canReview(productId, user.id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  createReview(
    @Param("productId") productId: string,
    @CurrentUser() user: AuthUser,
    @Body() createReviewDto: CreateReviewDto,
  ) {
    return this.reviewsService.createReview(productId, user.id, createReviewDto);
  }
}
