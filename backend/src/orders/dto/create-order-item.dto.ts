import { IsInt, IsNumber, IsOptional, IsString, IsUUID, Min, MinLength } from "class-validator";
import { Type } from "class-transformer";

export class CreateOrderItemDto {
  @IsUUID()
  productId: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  quantity: number;

  @IsString()
  @MinLength(2)
  productName: string;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  price: number;

  @IsOptional()
  @IsString()
  size?: string;

  @IsOptional()
  @IsString()
  color?: string;
}
