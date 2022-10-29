import { Order } from 'src/order/entities/order.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('processes')
export class Process {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  numberOrders!: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  date!: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  @OneToMany(() => Order, (order) => order.process)
  orders: Order[];
}
