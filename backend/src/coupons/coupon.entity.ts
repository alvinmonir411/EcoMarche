import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { CouponType } from "./coupon-type.enum";

@Entity("coupons")
export class Coupon {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ unique: true })
  code: string;

  @Column({
    type: "enum",
    enum: CouponType,
  })
  type: CouponType;

  @Column("decimal", { precision: 10, scale: 2 })
  value: number;

  @Column("decimal", { precision: 10, scale: 2, default: 0 })
  minOrderAmount: number;

  @Column({ type: "timestamp" })
  expiryDate: Date;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
