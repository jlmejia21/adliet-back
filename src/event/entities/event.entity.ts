import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('events')
export class Event {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 100, nullable: true })
  category: string;

  @Column({ type: 'text', nullable: true })
  description!: string;

  @Column({ type: 'int', nullable: true })
  process_id!: number;

  @Column({ type: 'int', nullable: true })
  event_id_ref: number;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;
}
