import { Body, Controller, Get, Put, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { OrderService } from './order.service';

@ApiTags('Order')
@Controller('Order')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Get('/search')
  async querySql(@Query('store') store: string) {
    const data = await this.orderService.search(store);
    return { data };
  }

  @Put('/completed')
  editOne(@Body() body: any) {
    return this.orderService.updateCompleted(body.id);
  }
}
