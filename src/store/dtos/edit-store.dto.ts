import { PartialType } from '@nestjs/mapped-types';
import { CreateStoreDto } from './create-store.dto';

export class EditStoreDto extends PartialType(CreateStoreDto) {}
