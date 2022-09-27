import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CreateOrderDto } from './dtos';
import { OrderService } from './order.service';

@ApiTags('Order')
@Controller('order')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Get()
  async getMany() {
    const data = await this.orderService.getMany();
    return {
      message: 'Peticion correcta',
      data,
    };
  }

  @Get(':id')
  getOne(@Param('id', ParseIntPipe) id: number) {
    return this.orderService.getOne(id);
  }

  @Post()
  createOne(@Body() dto: CreateOrderDto) {
    return this.orderService.createOne(dto);
  }
  @Delete(':id')
  deleteOne(@Param('id', ParseIntPipe) id: number) {
    return this.orderService.deleteOne(id);
  }
}
