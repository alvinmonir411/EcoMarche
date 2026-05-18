import { Body, Controller, Get, Param, Patch, UseGuards } from "@nestjs/common";
import { Roles } from "../common/decorators/roles.decorator";
import { UserRole } from "../common/enums/user-role.enum";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { RolesGuard } from "../common/guards/roles.guard";
import { UpdateOrderStatusDto } from "../orders/dto/update-order-status.dto";
import { AdminService } from "./admin.service";

@Controller("admin")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get("users")
  getAllUsers() {
    return this.adminService.getAllUsers();
  }

  @Get("orders")
  getAllOrders() {
    return this.adminService.getAllOrders();
  }

  @Patch("orders/:id/status")
  updateOrderStatus(
    @Param("id") id: string,
    @Body() updateOrderStatusDto: UpdateOrderStatusDto,
  ) {
    return this.adminService.updateOrderStatus(id, updateOrderStatusDto);
  }

  @Get("products")
  getAllProducts() {
    return this.adminService.getAllProducts();
  }

  @Get("dashboard")
  getDashboardStats() {
    return this.adminService.getDashboardStats();
  }
}
