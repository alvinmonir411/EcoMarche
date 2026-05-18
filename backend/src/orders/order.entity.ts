import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { DeliveryStatus } from "../common/enums/delivery-status.enum";
import { OrderStatus } from "../common/enums/order-status.enum";
import { PaymentMethod } from "../common/enums/payment-method.enum";
import { PaymentStatus } from "../common/enums/payment-status.enum";
import type { Payment } from "../payments/payment.entity";
import { User } from "../users/user.entity";
import { OrderItem } from "./order-item.entity";

@Entity("orders")
export class Order {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  customerName: string;

  @Column()
  customerEmail: string;

  @Column()
  customerPhone: string;

  @Column("text")
  shippingAddress: string;

  @Column("decimal", { precision: 10, scale: 2, default: 0 })
  subtotal: number;

  @Column("decimal", { precision: 10, scale: 2, default: 0 })
  deliveryCharge: number;

  @Column("decimal", { precision: 10, scale: 2, default: 0 })
  discount: number;

  @Column({ nullable: true })
  couponCode?: string;

  @Column("decimal", { precision: 10, scale: 2, default: 0 })
  total: number;

  @Column({
    type: "enum",
    enum: PaymentMethod,
    default: PaymentMethod.CASH_ON_DELIVERY,
  })
  paymentMethod: PaymentMethod;

  @Column({
    type: "enum",
    enum: PaymentStatus,
    default: PaymentStatus.PENDING,
  })
  paymentStatus: PaymentStatus;

  @Column({
    type: "enum",
    enum: DeliveryStatus,
    default: DeliveryStatus.PENDING,
  })
  deliveryStatus: DeliveryStatus;

  @Column({
    type: "enum",
    enum: OrderStatus,
    default: OrderStatus.PENDING,
  })
  orderStatus: OrderStatus;

  @ManyToOne(() => User, (user) => user.orders, { nullable: true })
  user?: User;

  @OneToMany(() => OrderItem, (item) => item.order, { cascade: true })
  items: OrderItem[];

  @OneToOne("Payment", "order")
  payment?: Payment;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
