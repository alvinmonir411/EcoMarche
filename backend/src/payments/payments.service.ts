import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { DataSource, Repository } from "typeorm";
import { AuthUser } from "../auth/types/auth-user.type";
import { PaymentStatus } from "../common/enums/payment-status.enum";
import { UserRole } from "../common/enums/user-role.enum";
import { Order } from "../orders/order.entity";
import { CreatePaymentDto } from "./dto/create-payment.dto";
import { UpdatePaymentStatusDto } from "./dto/update-payment-status.dto";
import { Payment } from "./payment.entity";

@Injectable()
export class PaymentsService {
  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(Payment)
    private readonly paymentsRepository: Repository<Payment>,
  ) {}

  create(createPaymentDto: CreatePaymentDto) {
    const payment = this.paymentsRepository.create({
      method: createPaymentDto.method,
      transactionId: createPaymentDto.transactionId,
      amount: createPaymentDto.amount,
      order: { id: createPaymentDto.orderId } as Order,
    });

    return this.paymentsRepository.save(payment);
  }

  async findAll() {
    const payments = await this.paymentsRepository.find({
      relations: ["order", "order.user"],
      order: { createdAt: "DESC" },
    });

    return payments.map(payment => ({
      id: payment.id,
      transactionId: payment.transactionId,
      orderId: payment.order?.id,
      customerName: payment.order?.customerName,
      user: payment.order?.user ? { name: payment.order.user.name } : null,
      paymentMethod: payment.method || payment.order?.paymentMethod,
      amount: payment.amount,
      createdAt: payment.createdAt,
      status: payment.status,
    }));
  }

  async findOne(id: string) {
    const payment = await this.paymentsRepository.findOne({
      where: { id },
      relations: ["order"],
    });

    if (!payment) {
      throw new NotFoundException("Payment not found");
    }

    return payment;
  }

  async findByOrderId(orderId: string, user: AuthUser) {
    const where =
      user.role === UserRole.ADMIN
        ? { order: { id: orderId } }
        : { order: { id: orderId, user: { id: user.id } } };

    const payment = await this.paymentsRepository.findOne({
      where,
      relations: ["order", "order.user"],
    });

    if (!payment) {
      throw new NotFoundException("Payment not found for this order");
    }

    return payment;
  }

  async updateStatus(id: string, updatePaymentStatusDto: UpdatePaymentStatusDto) {
    return this.dataSource.transaction(async (manager) => {
      const payment = await manager.findOne(Payment, {
        where: { id },
        relations: ["order"],
      });

      if (!payment) {
        throw new NotFoundException("Payment not found");
      }

      payment.status = updatePaymentStatusDto.status;
      await manager.save(payment);

      if (payment.order) {
        await manager.update(Order, payment.order.id, {
          paymentStatus: updatePaymentStatusDto.status as PaymentStatus,
        });
      }

      return manager.findOne(Payment, {
        where: { id },
        relations: ["order"],
      });
    });
  }
}
