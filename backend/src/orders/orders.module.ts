import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CartItem } from "../carts/cart-item.entity";
import { Cart } from "../carts/cart.entity";
import { CouponsModule } from "../coupons/coupons.module";
import { Payment } from "../payments/payment.entity";
import { Product } from "../products/product.entity";
import { User } from "../users/user.entity";
import { OrderItem } from "./order-item.entity";
import { Order } from "./order.entity";
import { OrdersController } from "./orders.controller";
import { OrdersService } from "./orders.service";

@Module({
  imports: [
    CouponsModule,
    TypeOrmModule.forFeature([Order, OrderItem, Cart, CartItem, Product, User, Payment]),
  ],
  controllers: [OrdersController],
  providers: [OrdersService],
})
export class OrdersModule {}
