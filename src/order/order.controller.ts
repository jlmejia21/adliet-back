import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CreateOrderDto } from './dtos';
import { OrderService } from './order.service';

@ApiTags('Order')
@Controller('order')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Get('/search')
  async getOrdersByFilter(
    @Query('id_store') id_store?: string,
    @Query('start_date') start_date?: string,
    @Query('end_date') end_date?: string,
  ) {
    const data = await this.orderService.getOrdersByFilter(
      id_store,
      start_date,
      end_date,
    );
    return {
      message: 'Peticion correcta',
      data,
    };
  }

  @Get('/store/:id')
  async getOrdersPendingByStore(@Param('id', ParseIntPipe) id: number) {
    const data = await this.orderService.getOrdersPendingByStore(id);
    return {
      message: 'Peticion correcta',
      data,
    };
  }

  @Get('/store/all/:id')
  async getAllOrdersByStore(@Param('id', ParseIntPipe) id: number) {
    const data = await this.orderService.getAllOrdersByStore(id);
    return {
      message: 'Peticion correcta',
      data,
    };
  }

  @Post('/find')
  async getOrdersByCodes(@Body() request) {
    const data = await this.orderService.getOrdersByCodes(request);
    return {
      message: 'Peticion correcta',
      data,
    };
  }

  @Put(':id')
  updateCompleted(@Param('id', ParseIntPipe) id: number) {
    return this.orderService.updateCompleted(id);
  }

  @Get('/reportCountStore')
  async getCountsOrdersGroupByStore() {
    const data = await this.orderService.getCountsOrdersGroupByStore();
    return {
      message: 'Peticion correcta',
      data,
    };
  }

  @Get('/reportGroupSent')
  async getOrdersByGroupSent() {
    const data = await this.orderService.getOrdersByGroupSent();
    return {
      message: 'Peticion correcta',
      data,
    };
  }

  @Get('/ordersByStoreGroupByDate')
  async getOrdersBygetOrdersByStoreGroupByDateGroupSent() {
    const data = await this.orderService.getOrdersByStoreGroupByDate();
    return {
      message: 'Peticion correcta',
      data,
    };
  }

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
