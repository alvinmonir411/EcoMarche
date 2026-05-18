import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { DeliveryStatus } from "../common/enums/delivery-status.enum";
import { OrderStatus } from "../common/enums/order-status.enum";
import { UserRole } from "../common/enums/user-role.enum";
import { UpdateOrderStatusDto } from "../orders/dto/update-order-status.dto";
import { Order } from "../orders/order.entity";
import { Product } from "../products/product.entity";
import { User } from "../users/user.entity";

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    @InjectRepository(Order)
    private readonly ordersRepository: Repository<Order>,
    @InjectRepository(Product)
    private readonly productsRepository: Repository<Product>,
  ) {}

  getAllUsers() {
    return this.usersRepository.find({
      order: { createdAt: "DESC" },
    });
  }

  getAllOrders() {
    return this.ordersRepository.find({
      relations: ["user", "items", "items.product", "payment"],
      order: { createdAt: "DESC" },
    });
  }

  getAllProducts() {
    return this.productsRepository.find({
      relations: ["category", "images"],
      order: { createdAt: "DESC" },
    });
  }

  async updateOrderStatus(id: string, updateOrderStatusDto: UpdateOrderStatusDto) {
    const order = await this.ordersRepository.findOne({ where: { id } });

    if (!order) {
      throw new NotFoundException("Order not found");
    }

    if (updateOrderStatusDto.orderStatus) {
      order.orderStatus = updateOrderStatusDto.orderStatus;
      order.deliveryStatus =
        updateOrderStatusDto.orderStatus as unknown as DeliveryStatus;
    }

    if (updateOrderStatusDto.deliveryStatus) {
      order.deliveryStatus = updateOrderStatusDto.deliveryStatus;
    }

    if (updateOrderStatusDto.paymentStatus) {
      order.paymentStatus = updateOrderStatusDto.paymentStatus;
    }

    if (order.orderStatus === OrderStatus.CANCELLED) {
      order.deliveryStatus = DeliveryStatus.CANCELLED;
    }

    await this.ordersRepository.save(order);

    return this.ordersRepository.findOne({
      where: { id },
      relations: ["user", "items", "items.product", "payment"],
    });
  }

  async getDashboardStats() {
    const totalOrders = await this.ordersRepository.count();
    const totalProducts = await this.productsRepository.count();
    const totalCustomers = await this.usersRepository.count({
      where: { role: UserRole.USER },
    });

    const salesResult = await this.ordersRepository
      .createQueryBuilder("order")
      .select("COALESCE(SUM(order.total), 0)", "totalSales")
      .where("order.orderStatus != :status", { status: OrderStatus.CANCELLED })
      .getRawOne<{ totalSales: string }>();

    return {
      totalSales: Number(salesResult?.totalSales ?? 0),
      totalOrders,
      totalProducts,
      totalCustomers,
    };
  }
}
