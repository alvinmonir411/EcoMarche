import { Type } from "class-transformer";
import { IsEnum, IsNumber, IsOptional, IsString, IsUUID, Min } from "class-validator";
import { PaymentMethod } from "../../common/enums/payment-method.enum";

export class CreatePaymentDto {
  @IsEnum(PaymentMethod)
  method: PaymentMethod;

  @IsUUID()
  orderId: string;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  amount: number;

  @IsOptional()
  @IsString()
  transactionId?: string;
}
