import { IsEnum, IsNumber, IsString } from 'class-validator';
import { EnumToString } from 'src/auth/common/helpers/enumToString';
import { EventCategory } from '../enums';

export class CreateEventDto {
  @IsEnum(EventCategory, {
    message: `Opcion invalida. Las opciones correctas son: ${EnumToString(
      EventCategory,
    )}`,
  })
  category: EventCategory;

  @IsString()
  description: string;

  @IsNumber()
  process_id: number;

  @IsNumber()
  event_id_ref: number;
}
