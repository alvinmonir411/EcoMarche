import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
} from "@nestjs/common";
import { Request } from "express";
import { CartsService } from "./carts.service";
import { AddCartItemDto } from "./dto/add-cart-item.dto";
import { UpdateCartItemDto } from "./dto/update-cart-item.dto";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { AuthUser } from "../auth/types/auth-user.type";

type AuthenticatedRequest = Request & {
  user: AuthUser;
};

@Controller("carts")
@UseGuards(JwtAuthGuard)
export class CartsController {
  constructor(private readonly cartsService: CartsService) {}

  @Get("my")
  async getMyCart(@Req() req: AuthenticatedRequest) {
    const cart = await this.cartsService.getCartByUserId(req.user.id);
    return this.cartsService.calculateCartTotal(cart);
  }

  @Post("add")
  async addItem(
    @Req() req: AuthenticatedRequest,
    @Body() addItemDto: AddCartItemDto,
  ) {
    const cart = await this.cartsService.addItem(req.user.id, addItemDto);
    return this.cartsService.calculateCartTotal(cart);
  }

  @Patch("update/:itemId")
  async updateItem(
    @Req() req: AuthenticatedRequest,
    @Param("itemId") itemId: string,
    @Body() updateDto: UpdateCartItemDto,
  ) {
    const cart = await this.cartsService.updateItemQuantity(
      req.user.id,
      itemId,
      updateDto.quantity,
    );
    return this.cartsService.calculateCartTotal(cart);
  }

  @Delete("remove/:itemId")
  async removeItem(
    @Req() req: AuthenticatedRequest,
    @Param("itemId") itemId: string,
  ) {
    const cart = await this.cartsService.removeItem(req.user.id, itemId);
    return this.cartsService.calculateCartTotal(cart);
  }

  @Delete("clear")
  async clearCart(@Req() req: AuthenticatedRequest) {
    const cart = await this.cartsService.clearCart(req.user.id);
    return this.cartsService.calculateCartTotal(cart);
  }
}
