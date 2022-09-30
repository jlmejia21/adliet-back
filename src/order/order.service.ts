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
        'SUM(CASE WHEN orders.STATUS = "1"  THEN 1 ELSE 0 END)',
        'sent',
      )
      .addSelect(
        'SUM(CASE WHEN orders.STATUS = "0"  THEN 1 ELSE 0 END)',
        'not_sent',
      )
      .groupBy('store.name')
      .getRawMany();
    return result;
  }

  async getOrdersByStoreGroupByDate() {
    const query = `
    SELECT
    ST.NAME as name,
    (
    SELECT 
    count(O.ID) AS CANTIDAD_YEAR
    FROM STORES S LEFT JOIN ORDERS O ON (O.STORE_ID = S.ID AND YEAR(O.CREATED_AT) = YEAR(CURDATE()))
    WHERE ST.ID = S.ID
    GROUP BY S.ID
    ) orders_year,
    (
    SELECT 
    count(O.ID) AS CANTIDAD_MONTH
    FROM STORES S LEFT JOIN ORDERS O ON (O.STORE_ID = S.ID AND  YEAR(O.CREATED_AT) = YEAR(CURDATE()) AND MONTH(O.CREATED_AT) = MONTH(CURDATE()))
    WHERE  ST.ID = S.ID
    GROUP BY S.ID
    ) orders_month,
    (
    SELECT 
    count(O.ID) AS CANTIDAD_DAY
    FROM  STORES S LEFT JOIN  ORDERS O ON (O.STORE_ID = S.ID AND YEAR(O.CREATED_AT) = YEAR(CURDATE()) AND MONTH(O.CREATED_AT) = MONTH(CURDATE()) AND DAY(O.CREATED_AT) = DAY(CURDATE()))
    WHERE ST.ID = S.ID
    GROUP BY S.ID
    ) orders_day
    FROM STORES ST
    `;
    return this.connection.query(query);
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
