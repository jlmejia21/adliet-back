import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { EventModule } from 'src/event/event.module';
import { OrderModule } from 'src/order/order.module';
import { ProcessModule } from 'src/process/process.module';
import { EmailController } from './email.controller';
import { EmailService } from './email.service';
@Module({
  controllers: [EmailController],
  providers: [EmailService],
  imports: [HttpModule, ProcessModule, OrderModule, EventModule],
})
export class EmailModule {}
