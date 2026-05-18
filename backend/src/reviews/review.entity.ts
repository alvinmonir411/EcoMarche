import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { Product } from "../products/product.entity";
import { User } from "../users/user.entity";
import { Order } from "../orders/order.entity";

@Entity("reviews")
export class Review {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column("int")
  rating: number;

  @Column("text")
  comment: string;

  @ManyToOne(() => Product, { onDelete: "CASCADE" })
  product: Product;

  @ManyToOne(() => User, { onDelete: "CASCADE" })
  user: User;

  @ManyToOne(() => Order, { nullable: true, onDelete: "SET NULL" })
  order: Order;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
