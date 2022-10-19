import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectConnection, InjectRepository } from '@nestjs/typeorm';
import { Between, Connection, In, IsNull, Not, Repository } from 'typeorm';
import { CreateOrderDto } from './dtos';
import { Order } from './entities/order.entity';
@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectConnection() private readonly connection: Connection,
  ) {}

  getDateFormat(dateStr: string) {
    const parameters = dateStr.split('-');
    const date = new Date(
      Number(parameters[0]),
      Number(parameters[1]) - 1,
      Number(parameters[2]),
    );
    // first hour
    date.setHours(-5, 0, 1);
    return date;
  }

  getDateHourFormat(dateStr: string) {
    const parameters = dateStr.split('-');
    const date = new Date(
      Number(parameters[0]),
      Number(parameters[1]) - 1,
      Number(parameters[2]),
    );
    // last hour
    date.setHours(18, 59, 59);
    return date;
  }

  async getOrdersByFilter(
    id_store?: string,
    start_date?: string,
    end_date?: string,
  ): Promise<Order[]> {
    return await this.orderRepository.find({
      where: {
        store: {
          id: id_store === 'null' ? Not(IsNull()) : Number(id_store),
        },
        createdAt: Between(
          start_date === 'null'
            ? new Date(1999, 1, 1)
            : this.getDateFormat(start_date),
          end_date === 'null'
            ? new Date(2050, 12, 31)
            : this.getDateHourFormat(end_date),
        ),
      },
      relations: {
        process: true,
        store: true,
      },
    });
  }

  async getOrdersPendingByStore(id: number): Promise<Order[]> {
    return await this.orderRepository.find({
      where: {
        store: {
          id,
        },
        status: false,
      },
      relations: {
        process: true,
        store: true,
      },
    });
  }

  async getOrdersByCodes(request): Promise<Order[]> {
    return await this.orderRepository.find({
      where: {
        code: In([...request.codes]),
      },
    });
  }

  async updateCompleted(id: number) {
    const order = await this.orderRepository.findOne({
      where: { id: id },
    });
    if (!order) throw new NotFoundException('Order does not exist');
    order.status = true;
    order.completedAt = new Date();
    return await this.orderRepository.save(order);
  }

  async getCountsOrdersGroupByStore() {
    const result = await this.orderRepository
      .createQueryBuilder('orders')
      .innerJoinAndSelect('orders.store', 'store')
      .select('store.name')
      .addSelect('COUNT(orders.id)', 'orders')
      .groupBy('store.name')
      .getRawMany();
    return result;
  }

  async getOrdersByGroupSent() {
    const result = await this.orderRepository
      .createQueryBuilder('orders')
      .innerJoinAndSelect('orders.store', 'store')
      .select('store.name')
      .addSelect(
        'SUM(CASE WHEN orders.status = true THEN 1 ELSE 0 END)',
        'sent',
      )
      .addSelect(
        'SUM(CASE WHEN orders.status = false  THEN 1 ELSE 0 END)',
        'not_sent',
      )
      .groupBy('store.name')
      .getRawMany();
    return result;
  }

  async getOrdersByStoreGroupByDate() {
    let result: any;
    try {
      const query = `
      select
      st.name as name,
      (
      select 
      count(o.id) as cantidad_year
      from stores s left join orders o on (o.store_id = s.id and year(o.created_at) = year(curdate()))
      where st.id = s.id
      group by s.id
      ) orders_year,
      (
      select 
      count(o.id) as cantidad_month
      from stores s left join orders o on (o.store_id = s.id and  year(o.created_at) = year(curdate()) and month(o.created_at) = month(curdate()))
      where  st.id = s.id
      group by s.id
      ) orders_month,
      (
      select 
      count(o.id) as cantidad_day
      from  stores s left join  orders o on (o.store_id = s.id and year(o.created_at) = year(curdate()) and month(o.created_at) = month(curdate()) and day(o.created_at) = day(curdate()))
      where st.id = s.id
      group by s.id
      ) orders_day
      from stores st;
      `;

      result = await this.connection.query(query);
    } catch (error) {
      result = [];
    }
    return result;
  }

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
