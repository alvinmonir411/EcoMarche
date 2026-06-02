import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { DataSource, Repository } from "typeorm";
import { CartItem } from "../carts/cart-item.entity";
import { Cart } from "../carts/cart.entity";
import { DeliveryStatus } from "../common/enums/delivery-status.enum";
import { OrderStatus } from "../common/enums/order-status.enum";
import { PaymentMethod } from "../common/enums/payment-method.enum";
import { PaymentStatus } from "../common/enums/payment-status.enum";
import { CouponsService } from "../coupons/coupons.service";
import { Payment } from "../payments/payment.entity";
import { Product } from "../products/product.entity";
import { User } from "../users/user.entity";
import { CreateOrderDto } from "./dto/create-order.dto";
import { UpdateOrderStatusDto } from "./dto/update-order-status.dto";
import { OrderItem } from "./order-item.entity";
import { Order } from "./order.entity";

@Injectable()
export class OrdersService {
  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(Order)
    private readonly ordersRepository: Repository<Order>,
    @InjectRepository(Payment)
    private readonly paymentsRepository: Repository<Payment>,
    private readonly couponsService: CouponsService,
  ) {}

  async checkout(userId: string, createOrderDto: CreateOrderDto) {
    return this.dataSource.transaction(async (manager) => {
      const cart = await manager.findOne(Cart, {
        where: { user: { id: userId } },
        relations: ["items", "items.product"],
      });

      if (!cart || cart.items.length === 0) {
        throw new BadRequestException("Your cart is empty");
      }

      for (const item of cart.items) {
        if (!item.product) {
          throw new NotFoundException("Product not found in cart");
        }

        if (item.product.stock < item.quantity) {
          throw new BadRequestException(
            `${item.product.name} has only ${item.product.stock} item(s) in stock`,
          );
        }
      }

      const subtotal = this.calculateSubtotal(cart.items);
      const deliveryCharge = createOrderDto.deliveryCharge ?? 0;
      let discount = 0;
      let couponCode: string | undefined;

      if (createOrderDto.couponCode) {
        const coupon = await this.couponsService.getValidCoupon(
          createOrderDto.couponCode,
          subtotal,
        );

        discount = this.couponsService.calculateDiscount(coupon, subtotal);
        couponCode = coupon.code;
      }

      const total = Math.max(subtotal + deliveryCharge - discount, 0);
      const paymentMethod =
        createOrderDto.paymentMethod ?? PaymentMethod.CASH_ON_DELIVERY;

      const order = manager.create(Order, {
        customerName: createOrderDto.customerName,
        customerEmail: createOrderDto.customerEmail,
        customerPhone: createOrderDto.customerPhone,
        shippingAddress: createOrderDto.shippingAddress,
        subtotal,
        deliveryCharge,
        discount,
        couponCode,
        total,
        paymentMethod,
        paymentStatus: PaymentStatus.PENDING,
        user: { id: userId } as User,
        items: cart.items.map((item) =>
          manager.create(OrderItem, {
            quantity: item.quantity,
            productName: item.product.name,
            price: this.getProductPrice(item.product),
            size: item.size ?? item.product.sizes?.[0] ?? "",
            color: item.color ?? item.product.colors?.[0] ?? "",
            product: { id: item.product.id } as Product,
          }),
        ),
      });

      const savedOrder = await manager.save(order);

      const payment = manager.create(Payment, {
        method: paymentMethod,
        status: PaymentStatus.PENDING,
        amount: total,
        order: { id: savedOrder.id } as Order,
      });

      await manager.save(payment);

      for (const item of cart.items) {
        await manager.decrement(
          Product,
          { id: item.product.id },
          "stock",
          item.quantity,
        );
      }

      await manager
        .createQueryBuilder()
        .delete()
        .from(CartItem)
        .where("cartId = :cartId", { cartId: cart.id })
        .execute();

      const orderDetails = await manager.findOne(Order, {
        where: { id: savedOrder.id },
        relations: ["items", "items.product", "payment"],
      });

      if (!orderDetails) {
        throw new NotFoundException("Order not found");
      }

      return orderDetails;
    });
  }

  findAll() {
    return this.ordersRepository.find({
      relations: ["user", "items", "items.product", "payment"],
      order: { createdAt: "DESC" },
    });
  }

  findOne(id: string) {
    return this.ordersRepository.findOne({
      where: { id },
      relations: ["user", "items", "items.product", "payment"],
    });
  }

  findMyOrders(userId: string) {
    return this.ordersRepository.find({
      where: { user: { id: userId } },
      relations: ["items", "items.product", "payment"],
      order: { createdAt: "DESC" },
    });
  }

  async findOneForUser(id: string, userId: string) {
    const order = await this.ordersRepository.findOne({
      where: { id, user: { id: userId } },
      relations: ["items", "items.product", "payment"],
    });

    if (!order) {
      throw new NotFoundException("Order not found");
    }

    return order;
  }

  async updateStatus(id: string, updateOrderStatusDto: UpdateOrderStatusDto) {
    const order = await this.findOne(id);

    if (!order) {
      throw new NotFoundException("Order not found");
    }

    if (updateOrderStatusDto.orderStatus) {
      order.orderStatus = updateOrderStatusDto.orderStatus;
      order.deliveryStatus = updateOrderStatusDto.orderStatus as unknown as DeliveryStatus;
    }

    if (updateOrderStatusDto.paymentStatus) {
      order.paymentStatus = updateOrderStatusDto.paymentStatus;

      const payment = await this.paymentsRepository.findOne({
        where: { order: { id } },
      });

      if (payment) {
        payment.status = updateOrderStatusDto.paymentStatus;
        await this.paymentsRepository.save(payment);
      }
    }

    if (updateOrderStatusDto.deliveryStatus) {
      order.deliveryStatus = updateOrderStatusDto.deliveryStatus;
    }

    if (order.orderStatus === OrderStatus.CANCELLED) {
      order.deliveryStatus = DeliveryStatus.CANCELLED;
    }

    await this.ordersRepository.save(order);
    return this.findOne(id);
  }

  private calculateSubtotal(items: CartItem[]) {
    const subtotal = items.reduce((total, item) => {
      return total + this.getProductPrice(item.product) * item.quantity;
    }, 0);

    return Number(subtotal.toFixed(2));
  }

  private getProductPrice(product: Product) {
    return Number(product.discountPrice ?? product.price);
  }
}
