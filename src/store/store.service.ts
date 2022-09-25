import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectConnection, InjectRepository } from '@nestjs/typeorm';
import { Connection, Repository } from 'typeorm';
import { CreateStoreDto, EditStoreDto } from './dtos';
import { Store } from './entities/store.entity';
@Injectable()
export class StoreService {
  constructor(
    @InjectRepository(Store)
    private readonly storeRepository: Repository<Store>,
    @InjectConnection() private readonly connection: Connection,
  ) {}

  async search(
    store: string | null,
    start_date: string | null,
    end_date: string | null,
  ) {
    const start_date_default = '1999-01-01';
    const end_date_default = '2050-12-30';

    const query = `
    SELECT distinct
      s.name as store_name,
      concat(c.name, ' ', c.last_name) as customer_name ,
      pd.id as process_detail_id,
      p.date,
      p.start_time,
      p.end_time,
      pd.completed
      FROM processes p
      inner join processes_detail pd on p.id = pd.id_process
      inner join stores s on s.id = pd.id_store
      inner join orders o on o.id = pd.id_order
      inner join customers c on c.id = o.id_customer
      where  1 = 1
      and ( ${store} IS NULL OR s.id = ${store} )
      and date >= ?
      and date <= ?
    `;
    return this.connection.query(query, [
      start_date === 'null' ? start_date_default : start_date,
      end_date === 'null' ? end_date_default : end_date,
    ]);
  }

  async getMany(): Promise<Store[]> {
    return await this.storeRepository.find();
  }
  async getOne(id: number) {
    const store = await this.storeRepository.findOne({
      where: { id: id },
    });
    if (!store) throw new NotFoundException('Store does not exist');
    return store;
  }
  async createOne(dto: CreateStoreDto) {
    const post = this.storeRepository.create(dto as any);
    return await this.storeRepository.save(post);
  }
  async editOne(id: number, dto: EditStoreDto) {
    const store = await this.storeRepository.findOne({
      where: { id: id },
    });
    if (!store) throw new NotFoundException('Store does not exist');
    const editedStore = Object.assign(store, dto);
    return await this.storeRepository.save(editedStore);
  }
  async deleteOne(id: number) {
    return await this.storeRepository.delete(id);
  }
}
