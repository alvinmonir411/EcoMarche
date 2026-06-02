import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { HomepageSection, HomepageSectionProduct } from "./entities/homepage-section.entity";
import { Product } from "../products/product.entity";
import { HomepageSectionsController } from "./homepage-sections.controller";
import { HomepageSectionsService } from "./homepage-sections.service";

@Module({
  imports: [
    TypeOrmModule.forFeature([HomepageSection, HomepageSectionProduct, Product]),
  ],
  controllers: [HomepageSectionsController],
  providers: [HomepageSectionsService],
  exports: [HomepageSectionsService],
})
export class HomepageSectionsModule {}
