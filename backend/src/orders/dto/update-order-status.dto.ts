import { IsEnum, IsOptional } from "class-validator";
import { DeliveryStatus } from "../../common/enums/delivery-status.enum";
import { OrderStatus } from "../../common/enums/order-status.enum";
import { PaymentStatus } from "../../common/enums/payment-status.enum";

export class UpdateOrderStatusDto {
  @IsOptional()
  @IsEnum(PaymentStatus)
  paymentStatus?: PaymentStatus;

  @IsOptional()
  @IsEnum(DeliveryStatus)
  deliveryStatus?: DeliveryStatus;

  @IsOptional()
  @IsEnum(OrderStatus)
  orderStatus?: OrderStatus;
}
