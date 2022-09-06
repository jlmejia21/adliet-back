import { IsString } from 'class-validator';

export class CreateStoreDto {
  @IsString()
  name: string;

  @IsString()
  code: string;

  @IsString()
  direction: string;

  @IsString()
  latitude: string;

  @IsString()
  longitude: string;
}
