import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { HomepageBanner } from "./entities/homepage-banner.entity";
import { HomepageBannersController } from "./homepage-banners.controller";
import { HomepageBannersService } from "./homepage-banners.service";

@Module({
  imports: [
    TypeOrmModule.forFeature([HomepageBanner]),
  ],
  controllers: [HomepageBannersController],
  providers: [HomepageBannersService],
  exports: [HomepageBannersService],
})
export class HomepageBannersModule {}
