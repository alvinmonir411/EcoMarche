import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { Category } from "../categories/category.entity";
import { CartItem } from "../carts/cart-item.entity";
import { OrderItem } from "../orders/order-item.entity";
import { Wishlist } from "../wishlists/wishlist.entity";
import { ProductImage } from "./product-image.entity";

@Entity("products")
export class Product {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  name: string;

  @Column({ unique: true })
  slug: string;

  @Column("text")
  description: string;

  @Column("decimal", { precision: 10, scale: 2 })
  price: number;

  @Column("decimal", { precision: 10, scale: 2, nullable: true })
  discountPrice?: number;

  @Column()
  stock: number;

  @Column("simple-array", { nullable: true })
  sizes: string[];

  @Column("simple-array", { nullable: true })
  colors: string[];

  @Column()
  thumbnail: string;

  @ManyToOne(() => Category, (category) => category.products)
  category: Category;

  @OneToMany(() => ProductImage, (image) => image.product, { cascade: true })
  images: ProductImage[];

  @OneToMany(() => CartItem, (cartItem) => cartItem.product)
  cartItems: CartItem[];

  @OneToMany(() => OrderItem, (orderItem) => orderItem.product)
  orderItems: OrderItem[];

  @OneToMany(() => Wishlist, (wishlist) => wishlist.product)
  wishlistItems: Wishlist[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
