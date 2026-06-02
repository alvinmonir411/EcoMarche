import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";
import { Roles } from "../common/decorators/roles.decorator";
import { UserRole } from "../common/enums/user-role.enum";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { RolesGuard } from "../common/guards/roles.guard";
import { HomepageBannersService } from "./homepage-banners.service";
import { CreateHomepageBannerDto } from "./dto/create-homepage-banner.dto";
import { UpdateHomepageBannerDto } from "./dto/update-homepage-banner.dto";

@Controller("homepage-banners")
export class HomepageBannersController {
  constructor(
    private readonly homepageBannersService: HomepageBannersService,
  ) {}

  @Get()
  findAll(@Query("admin") admin?: string) {
    const onlyEnabled = admin !== "true";
    return this.homepageBannersService.findAll(onlyEnabled);
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.homepageBannersService.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  create(@Body() createHomepageBannerDto: CreateHomepageBannerDto) {
    return this.homepageBannersService.create(createHomepageBannerDto);
  }

  @Patch("reorder")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  reorder(@Body("bannerIds") bannerIds: string[]) {
    return this.homepageBannersService.reorder(bannerIds);
  }

  @Patch(":id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  update(
    @Param("id") id: string,
    @Body() updateHomepageBannerDto: UpdateHomepageBannerDto,
  ) {
    return this.homepageBannersService.update(id, updateHomepageBannerDto);
  }

  @Delete(":id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  remove(@Param("id") id: string) {
    return this.homepageBannersService.remove(id);
  }
}
