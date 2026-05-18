import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Order } from "../orders/order.entity";
import { Product } from "../products/product.entity";
import { User } from "../users/user.entity";
import { AdminController } from "./admin.controller";
import { AdminService } from "./admin.service";

@Module({
  imports: [TypeOrmModule.forFeature([User, Order, Product])],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
