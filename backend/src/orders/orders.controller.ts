import { Body, Controller, Get, Param, Patch, Post, UseGuards } from "@nestjs/common";
import { AuthUser } from "../auth/types/auth-user.type";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import { Roles } from "../common/decorators/roles.decorator";
import { UserRole } from "../common/enums/user-role.enum";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { RolesGuard } from "../common/guards/roles.guard";
import { CreateOrderDto } from "./dto/create-order.dto";
import { UpdateOrderStatusDto } from "./dto/update-order-status.dto";
import { OrdersService } from "./orders.service";

@Controller("orders")
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post("checkout")
  @UseGuards(JwtAuthGuard)
  checkout(
    @CurrentUser() user: AuthUser,
    @Body() createOrderDto: CreateOrderDto,
  ) {
    return this.ordersService.checkout(user.id, createOrderDto);
  }

  @Get("my")
  @UseGuards(JwtAuthGuard)
  findMyOrders(@CurrentUser() user: AuthUser) {
    return this.ordersService.findMyOrders(user.id);
  }

  @Get("my/:id")
  @UseGuards(JwtAuthGuard)
  findMyOrderDetails(@CurrentUser() user: AuthUser, @Param("id") id: string) {
    return this.ordersService.findOneForUser(id, user.id);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  findAll() {
    return this.ordersService.findAll();
  }

  @Get(":id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  findOne(@Param("id") id: string) {
    return this.ordersService.findOne(id);
  }

  @Patch(":id/status")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  updateStatus(
    @Param("id") id: string,
    @Body() updateOrderStatusDto: UpdateOrderStatusDto,
  ) {
    return this.ordersService.updateStatus(id, updateOrderStatusDto);
  }
}
