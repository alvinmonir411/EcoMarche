import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Product } from "../products/product.entity";
import { Wishlist } from "./wishlist.entity";
import { WishlistsController } from "./wishlists.controller";
import { WishlistsService } from "./wishlists.service";

@Module({
  imports: [TypeOrmModule.forFeature([Wishlist, Product])],
  controllers: [WishlistsController],
  providers: [WishlistsService],
})
export class WishlistsModule {}
