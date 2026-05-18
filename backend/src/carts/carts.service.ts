import { Injectable, NotFoundException, BadRequestException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, IsNull } from "typeorm";
import { Product } from "../products/product.entity";
import { User } from "../users/user.entity";
import { CartItem } from "./cart-item.entity";
import { Cart } from "./cart.entity";
import { AddCartItemDto } from "./dto/add-cart-item.dto";

@Injectable()
export class CartsService {
  constructor(
    @InjectRepository(Cart)
    private readonly cartsRepository: Repository<Cart>,
    @InjectRepository(CartItem)
    private readonly cartItemsRepository: Repository<CartItem>,
    @InjectRepository(Product)
    private readonly productsRepository: Repository<Product>,
  ) {}

  async getCartByUserId(userId: string): Promise<Cart> {
    let cart = await this.cartsRepository.findOne({
      where: { user: { id: userId } },
      relations: ["items", "items.product"],
    });

    if (!cart) {
      // Create cart if it doesn't exist
      cart = this.cartsRepository.create({
        user: { id: userId } as User,
        items: [],
      });
      cart = await this.cartsRepository.save(cart);
    }

    return cart;
  }

  async addItem(userId: string, addItemDto: AddCartItemDto) {
    const { productId, quantity, size, color } = addItemDto;
    const selectedSize = size ?? null;
    const selectedColor = color ?? null;

    // 1. Get user cart
    const cart = await this.getCartByUserId(userId);

    // 2. Check product exists and has enough stock
    const product = await this.productsRepository.findOne({ where: { id: productId } });
    if (!product) {
      throw new NotFoundException("Product not found");
    }

    if (product.stock < quantity) {
      throw new BadRequestException("Not enough stock available");
    }

    // 3. Check if item already exists in cart (same product, size, color)
    let cartItem = await this.cartItemsRepository.findOne({
      where: {
        cart: { id: cart.id },
        product: { id: productId },
        size: selectedSize === null ? IsNull() : selectedSize,
        color: selectedColor === null ? IsNull() : selectedColor,
      },
    });

    if (cartItem) {
      // Check stock for total quantity
      if (product.stock < cartItem.quantity + quantity) {
        throw new BadRequestException("Not enough stock available for this total quantity");
      }
      cartItem.quantity += quantity;
    } else {
      // Create new cart item
      cartItem = this.cartItemsRepository.create({
        cart,
        product,
        quantity,
        size: selectedSize,
        color: selectedColor,
      });
    }

    await this.cartItemsRepository.save(cartItem);
    return this.getCartByUserId(userId);
  }

  async updateItemQuantity(userId: string, itemId: string, quantity: number) {
    const cartItem = await this.cartItemsRepository.findOne({
      where: { id: itemId, cart: { user: { id: userId } } },
      relations: ["product"],
    });

    if (!cartItem) {
      throw new NotFoundException("Cart item not found");
    }

    if (cartItem.product.stock < quantity) {
      throw new BadRequestException("Not enough stock available");
    }

    cartItem.quantity = quantity;
    await this.cartItemsRepository.save(cartItem);
    return this.getCartByUserId(userId);
  }

  async removeItem(userId: string, itemId: string) {
    const cartItem = await this.cartItemsRepository.findOne({
      where: { id: itemId, cart: { user: { id: userId } } },
    });

    if (!cartItem) {
      throw new NotFoundException("Cart item not found");
    }

    await this.cartItemsRepository.remove(cartItem);
    return this.getCartByUserId(userId);
  }

  async clearCart(userId: string) {
    const cart = await this.getCartByUserId(userId);
    await this.cartItemsRepository.delete({ cart: { id: cart.id } });
    return this.getCartByUserId(userId);
  }

  // This helper can be used by controller to format the response with total
  calculateCartTotal(cart: Cart) {
    const subTotal = cart.items.reduce((acc, item) => {
      const price = item.product.discountPrice || item.product.price;
      return acc + Number(price) * item.quantity;
    }, 0);

    return {
      ...cart,
      totalItems: cart.items.length,
      subTotal: Number(subTotal.toFixed(2)),
    };
  }
}
