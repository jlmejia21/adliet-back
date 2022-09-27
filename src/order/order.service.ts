import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateOrderDto } from './dtos';
import { Order } from './entities/order.entity';
@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
  ) {}

  async getMany(): Promise<Order[]> {
    return await this.orderRepository.find({
      relations: {
        process: true,
        store: true,
      },
    });
  }
  async getOne(id: number) {
    const post = await this.orderRepository.findOne({
      where: { id: id },
      relations: {
        process: true,
        store: true,
      },
    });
    if (!post) throw new NotFoundException('Order does not exist');
    return post;
  }
  async createOne(dto: CreateOrderDto) {
    const post = this.orderRepository.create(dto as any);
    return await this.orderRepository.save(post);
  }
  async deleteOne(id: number) {
    return await this.orderRepository.delete(id);
  }
}
