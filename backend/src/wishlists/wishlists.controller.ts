import { Body, Controller, Delete, Get, Param, Post, UseGuards } from "@nestjs/common";
import { AuthUser } from "../auth/types/auth-user.type";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { CreateWishlistDto } from "./dto/create-wishlist.dto";
import { WishlistsService } from "./wishlists.service";

@Controller("wishlist")
@UseGuards(JwtAuthGuard)
export class WishlistsController {
  constructor(private readonly wishlistsService: WishlistsService) {}

  @Post()
  addToWishlist(
    @CurrentUser() user: AuthUser,
    @Body() createWishlistDto: CreateWishlistDto,
  ) {
    return this.wishlistsService.addToWishlist(user.id, createWishlistDto);
  }

  @Get()
  findMyWishlist(@CurrentUser() user: AuthUser) {
    return this.wishlistsService.findMyWishlist(user.id);
  }

  @Delete(":productId")
  removeFromWishlist(
    @CurrentUser() user: AuthUser,
    @Param("productId") productId: string,
  ) {
    return this.wishlistsService.removeFromWishlist(user.id, productId);
  }
}
