import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Order } from 'src/order/entities/order.entity';
import { Store } from 'src/store/entities/store.entity';
import { Repository } from 'typeorm';
import { Process } from './entities/process.entity';

@Injectable()
export class ProcessService {
  constructor(
    @InjectRepository(Process)
    private readonly processRepository: Repository<Process>,
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(Store)
    private readonly storeRepository: Repository<Store>,
  ) {}

  async getMany(): Promise<Process[]> {
    return await this.processRepository.find({
      relations: {
        orders: {
          store: true,
        },
      },
    });
  }
  async getOne(id: number) {
    const post = await this.processRepository.findOne({
      where: { id: id },
      relations: {
        orders: {
          store: true,
        },
      },
    });
    if (!post) throw new NotFoundException('Process does not exist');
    return post;
  }
  async createOne(dto) {
    const newProcess = this.processRepository.create(dto as any);
    const process = await this.processRepository.save(newProcess);
    const ordersSaved = [];
    dto.orders.forEach(async (order) => {
      const store = await this.storeRepository.findOne({
        where: { id: order.store_id },
      });
      order.process = process;
      order.store = store;
      this.orderRepository.create(order);
      const orderSaved = await this.orderRepository.save(order);
      ordersSaved.push(orderSaved);
    });
    return process;
  }
  async deleteOne(id: number) {
    return await this.processRepository.delete(id);
  }
}
