import { IsBoolean, IsOptional, IsString, MinLength } from "class-validator";
import { Type } from "class-transformer";

export class CreateAddressDto {
  @IsString()
  @MinLength(2)
  fullName: string;

  @IsString()
  phone: string;

  @IsString()
  division: string;

  @IsString()
  district: string;

  @IsString()
  upazila: string;

  @IsString()
  @MinLength(5)
  addressLine: string;

  @IsOptional()
  @IsString()
  postalCode?: string;

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  isDefault?: boolean;
}
