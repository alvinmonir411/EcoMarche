import { BadRequestException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { OrderStatus } from "../common/enums/order-status.enum";
import { Order } from "../orders/order.entity";
import { Product } from "../products/product.entity";
import { User } from "../users/user.entity";
import { CreateReviewDto } from "./dto/create-review.dto";
import { Review } from "./review.entity";

@Injectable()
export class ReviewsService {
  constructor(
    @InjectRepository(Review)
    private readonly reviewsRepository: Repository<Review>,
    @InjectRepository(Order)
    private readonly ordersRepository: Repository<Order>,
  ) {}

  async getReviewsByProduct(productId: string) {
    const reviews = await this.reviewsRepository.find({
      where: { product: { id: productId } },
      relations: ["user"],
      order: { createdAt: "DESC" },
    });

    const totalRatings = reviews.length;
    const averageRating =
      totalRatings > 0
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / totalRatings
        : 0;

    return {
      reviews,
      totalRatings,
      averageRating: Number(averageRating.toFixed(1)),
    };
  }

  async canReview(productId: string, userId: string) {
    // Check if user already reviewed this product
    const existingReview = await this.reviewsRepository.findOne({
      where: {
        product: { id: productId },
        user: { id: userId },
      },
    });

    if (existingReview) {
      return { canReview: false, reason: "You have already reviewed this product." };
    }

    // Check if user purchased and received the product
    const deliveredOrder = await this.ordersRepository
      .createQueryBuilder("order")
      .innerJoin("order.items", "item")
      .where("order.user.id = :userId", { userId })
      .andWhere("item.product.id = :productId", { productId })
      .andWhere("order.orderStatus = :status", { status: OrderStatus.DELIVERED })
      .getOne();

    if (!deliveredOrder) {
      return { canReview: false, reason: "Only verified buyers can rate this product." };
    }

    return { canReview: true, orderId: deliveredOrder.id };
  }

  async createReview(productId: string, userId: string, createReviewDto: CreateReviewDto) {
    const check = await this.canReview(productId, userId);

    if (!check.canReview) {
      throw new BadRequestException(check.reason);
    }

    const review = this.reviewsRepository.create({
      rating: createReviewDto.rating,
      comment: createReviewDto.comment,
      product: { id: productId } as Product,
      user: { id: userId } as User,
      order: { id: check.orderId } as Order,
    });

    return this.reviewsRepository.save(review);
  }
}
