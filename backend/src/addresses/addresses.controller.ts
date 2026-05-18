import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from "@nestjs/common";
import { AuthUser } from "../auth/types/auth-user.type";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { AddressesService } from "./addresses.service";
import { CreateAddressDto } from "./dto/create-address.dto";
import { UpdateAddressDto } from "./dto/update-address.dto";

@Controller("addresses")
@UseGuards(JwtAuthGuard)
export class AddressesController {
  constructor(private readonly addressesService: AddressesService) {}

  @Post()
  create(
    @CurrentUser() user: AuthUser,
    @Body() createAddressDto: CreateAddressDto,
  ) {
    return this.addressesService.create(user.id, createAddressDto);
  }

  @Get()
  findMyAddresses(@CurrentUser() user: AuthUser) {
    return this.addressesService.findMyAddresses(user.id);
  }

  @Get(":id")
  findOne(@CurrentUser() user: AuthUser, @Param("id") id: string) {
    return this.addressesService.findOneForUser(user.id, id);
  }

  @Patch(":id")
  update(
    @CurrentUser() user: AuthUser,
    @Param("id") id: string,
    @Body() updateAddressDto: UpdateAddressDto,
  ) {
    return this.addressesService.update(user.id, id, updateAddressDto);
  }

  @Patch(":id/default")
  setDefault(@CurrentUser() user: AuthUser, @Param("id") id: string) {
    return this.addressesService.setDefault(user.id, id);
  }

  @Delete(":id")
  remove(@CurrentUser() user: AuthUser, @Param("id") id: string) {
    return this.addressesService.remove(user.id, id);
  }
}
