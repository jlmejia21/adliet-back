import { IsArray, IsInt } from 'class-validator';

export class CreateProcessDto {
  @IsInt()
  numberOrders: number;

  @IsArray()
  orders: any[];
}
