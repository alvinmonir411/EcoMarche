import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
  UseGuards,
} from "@nestjs/common";
import { Roles } from "../common/decorators/roles.decorator";
import { UserRole } from "../common/enums/user-role.enum";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { RolesGuard } from "../common/guards/roles.guard";
import { HomepageSectionsService } from "./homepage-sections.service";
import { CreateHomepageSectionDto } from "./dto/create-homepage-section.dto";
import { UpdateHomepageSectionDto } from "./dto/update-homepage-section.dto";

@Controller("homepage-sections")
export class HomepageSectionsController {
  constructor(
    private readonly homepageSectionsService: HomepageSectionsService,
  ) {}

  @Get()
  findAll(@Query("admin") admin?: string) {
    const onlyEnabled = admin !== "true";
    return this.homepageSectionsService.findAll(onlyEnabled);
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.homepageSectionsService.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  create(@Body() createHomepageSectionDto: CreateHomepageSectionDto) {
    return this.homepageSectionsService.create(createHomepageSectionDto);
  }

  @Patch("reorder")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  reorder(@Body("sectionIds") sectionIds: string[]) {
    return this.homepageSectionsService.reorder(sectionIds);
  }

  @Patch(":id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  update(
    @Param("id") id: string,
    @Body() updateHomepageSectionDto: UpdateHomepageSectionDto,
  ) {
    return this.homepageSectionsService.update(id, updateHomepageSectionDto);
  }

  @Delete(":id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  remove(@Param("id") id: string) {
    return this.homepageSectionsService.remove(id);
  }

  @Put(":id/products")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  assignProducts(
    @Param("id") id: string,
    @Body("productIds") productIds: string[],
  ) {
    return this.homepageSectionsService.assignProducts(id, productIds);
  }
}
