import { IsInt, IsString } from 'class-validator';

export class CreateOrderDto {
  @IsString()
  code: string;

  @IsString()
  latitude: string;

  @IsString()
  longitude: string;

  @IsInt()
  process_id: number;
}
