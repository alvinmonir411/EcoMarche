import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { Product } from "../products/product.entity";
import { Order } from "./order.entity";

@Entity("order_items")
export class OrderItem {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  quantity: number;

  @Column()
  productName: string;

  @Column("decimal", { precision: 10, scale: 2 })
  price: number;

  @Column({ type: "text", nullable: true })
  size?: string;

  @Column({ type: "text", nullable: true })
  color?: string;

  @ManyToOne(() => Order, (order) => order.items, { onDelete: "CASCADE" })
  order: Order;

  @ManyToOne(() => Product, (product) => product.orderItems)
  product: Product;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
