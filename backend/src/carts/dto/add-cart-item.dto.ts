import { IsInt, IsOptional, IsString, IsUUID, Min } from "class-validator";
import { Type } from "class-transformer";

export class AddCartItemDto {
  @IsUUID()
  productId: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  quantity: number;

  @IsOptional()
  @IsString()
  size?: string;

  @IsOptional()
  @IsString()
  color?: string;
}
