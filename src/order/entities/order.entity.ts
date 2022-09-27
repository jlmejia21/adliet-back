import { Process } from 'src/process/entities/process.entity';
import { Store } from 'src/store/entities/store.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'text', nullable: false })
  code!: string;

  @Column({ type: 'text', nullable: false })
  latitude!: string;

  @Column({ type: 'text', nullable: false })
  longitude!: string;

  @Column({ type: 'bool', default: false })
  status: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  @ManyToOne(() => Process, (process) => process.orders)
  @JoinColumn({ name: 'process_id' })
  process: Process;

  @ManyToOne(() => Store, (store) => store.id)
  @JoinColumn({ name: 'store_id' })
  store: Store;
}
