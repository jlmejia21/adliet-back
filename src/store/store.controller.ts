import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CreateStoreDto, EditStoreDto } from './dtos';
import { StoreService } from './store.service';

@ApiTags('Store')
@Controller('store')
export class StoreController {
  constructor(private readonly storeService: StoreService) {}

  @Get()
  async getMany() {
    const data = await this.storeService.getMany();
    return {
      message: 'Peticion correcta',
      stores: data,
    };
  }

  @Get(':id')
  getOne(@Param('id', ParseIntPipe) id: number) {
    return this.storeService.getOne(id);
  }

  @Post()
  createOne(@Body() dto: CreateStoreDto) {
    return this.storeService.createOne(dto);
  }

  @Put(':id')
  editOne(@Param('id', ParseIntPipe) id: number, @Body() dto: EditStoreDto) {
    return this.storeService.editOne(id, dto);
  }

  @Delete(':id')
  deleteOne(@Param('id', ParseIntPipe) id: number) {
    return this.storeService.deleteOne(id);
  }
}
