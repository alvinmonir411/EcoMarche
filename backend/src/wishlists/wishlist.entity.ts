import {
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { Product } from "../products/product.entity";
import { User } from "../users/user.entity";

@Entity("wishlists")
export class Wishlist {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @ManyToOne(() => User, (user) => user.wishlistItems, { onDelete: "CASCADE" })
  user: User;

  @ManyToOne(() => Product, (product) => product.wishlistItems, {
    onDelete: "CASCADE",
  })
  product: Product;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
