import { IsBoolean, IsEnum, IsNumber, IsOptional, IsString } from "class-validator";
import { BannerType } from "../entities/homepage-banner.entity";

export class CreateHomepageBannerDto {
  @IsEnum(BannerType)
  type: BannerType;

  @IsString()
  title: string;

  @IsString()
  @IsOptional()
  subtitle?: string;

  @IsString()
  imageUrl: string;

  @IsString()
  @IsOptional()
  link?: string;

  @IsNumber()
  @IsOptional()
  displayOrder?: number;

  @IsBoolean()
  @IsOptional()
  enabled?: boolean;
}
