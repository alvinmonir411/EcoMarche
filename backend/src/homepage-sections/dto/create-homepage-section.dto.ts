import { IsBoolean, IsNumber, IsOptional, IsString } from "class-validator";

export class CreateHomepageSectionDto {
  @IsString()
  title: string;

  @IsString()
  @IsOptional()
  slug?: string;

  @IsBoolean()
  @IsOptional()
  enabled?: boolean;

  @IsNumber()
  @IsOptional()
  displayOrder?: number;
}
