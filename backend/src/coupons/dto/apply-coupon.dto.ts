import { Type } from "class-transformer";
import { IsNumber, IsString, Min, MinLength } from "class-validator";

export class ApplyCouponDto {
  @IsString()
  @MinLength(2)
  code: string;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  orderAmount: number;
}
