import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Product } from "../products/product.entity";
import { User } from "../users/user.entity";
import { CreateWishlistDto } from "./dto/create-wishlist.dto";
import { Wishlist } from "./wishlist.entity";

@Injectable()
export class WishlistsService {
  constructor(
    @InjectRepository(Wishlist)
    private readonly wishlistsRepository: Repository<Wishlist>,
    @InjectRepository(Product)
    private readonly productsRepository: Repository<Product>,
  ) {}

  async addToWishlist(userId: string, createWishlistDto: CreateWishlistDto) {
    const product = await this.productsRepository.findOne({
      where: { id: createWishlistDto.productId },
    });

    if (!product) {
      throw new NotFoundException("Product not found");
    }

    const existingWishlistItem = await this.wishlistsRepository.findOne({
      where: {
        user: { id: userId },
        product: { id: createWishlistDto.productId },
      },
    });

    if (existingWishlistItem) {
      throw new BadRequestException("Product already exists in wishlist");
    }

    const wishlist = this.wishlistsRepository.create({
      user: { id: userId } as User,
      product,
    });

    await this.wishlistsRepository.save(wishlist);
    return this.findMyWishlist(userId);
  }

  findMyWishlist(userId: string) {
    return this.wishlistsRepository.find({
      where: { user: { id: userId } },
      relations: ["product", "product.category", "product.images"],
      order: { createdAt: "DESC" },
    });
  }

  async removeFromWishlist(userId: string, productId: string) {
    const wishlistItem = await this.wishlistsRepository.findOne({
      where: {
        user: { id: userId },
        product: { id: productId },
      },
    });

    if (!wishlistItem) {
      throw new NotFoundException("Wishlist item not found");
    }

    await this.wishlistsRepository.remove(wishlistItem);
    return this.findMyWishlist(userId);
  }
}
