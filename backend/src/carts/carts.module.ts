import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CartItem } from "./cart-item.entity";
import { Cart } from "./cart.entity";
import { CartsController } from "./carts.controller";
import { CartsService } from "./carts.service";
import { Product } from "../products/product.entity";
import { AuthModule } from "../auth/auth.module";

@Module({
  imports: [
    TypeOrmModule.forFeature([Cart, CartItem, Product]),
    AuthModule,
  ],
  controllers: [CartsController],
  providers: [CartsService],
  exports: [CartsService],
})
export class CartsModule {}

