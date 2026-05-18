import { IsUUID } from "class-validator";

export class CreateCartDto {
  @IsUUID()
  userId: string;
}
