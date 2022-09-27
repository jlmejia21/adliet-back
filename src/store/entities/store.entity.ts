import { Order } from 'src/order/entities/order.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('stores')
export class Store {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'text', nullable: false })
  name!: string;

  @Column({ type: 'text', nullable: false })
  code!: string;

  @Column({ type: 'text', nullable: false })
  direction!: string;

  @Column({ type: 'text', nullable: true })
  latitude!: string;

  @Column({ type: 'text', nullable: true })
  longitude!: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  @OneToMany(() => Order, (order) => order.store)
  orders: Order[];
}
