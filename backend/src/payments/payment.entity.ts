import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { PaymentMethod } from "../common/enums/payment-method.enum";
import { PaymentStatus } from "../common/enums/payment-status.enum";
import { Order } from "../orders/order.entity";

@Entity("payments")
export class Payment {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({
    type: "enum",
    enum: PaymentMethod,
    default: PaymentMethod.CASH_ON_DELIVERY,
  })
  method: PaymentMethod;

  @Column({
    type: "enum",
    enum: PaymentStatus,
    default: PaymentStatus.PENDING,
  })
  status: PaymentStatus;

  @Column({ type: "text", nullable: true })
  transactionId?: string;

  @Column("decimal", { precision: 10, scale: 2, default: 0 })
  amount: number;

  @OneToOne(() => Order, (order) => order.payment)
  @JoinColumn({ name: "order_id" })
  order: Order;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
