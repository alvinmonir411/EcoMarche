import { Type } from "class-transformer";
import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  MinLength,
} from "class-validator";
import { CouponType } from "../coupon-type.enum";

export class CreateCouponDto {
  @IsString()
  @MinLength(2)
  code: string;

  @IsEnum(CouponType)
  type: CouponType;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  value: number;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  minOrderAmount: number;

  @IsDateString()
  expiryDate: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
