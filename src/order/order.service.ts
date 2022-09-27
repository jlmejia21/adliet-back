import { Injectable } from '@nestjs/common';
import { InjectConnection } from '@nestjs/typeorm';
import { Connection } from 'typeorm';
@Injectable()
export class OrderService {
  constructor(@InjectConnection() private readonly connection: Connection) {}

  async search(store: string) {
    const query = `
    SELECT
      pd.id as id_processes_detail, 
      o.id as id_order,
      concat(c.name, ' ', c.last_name) as cliente,
      c.latitude,
      c.longitude,
      pd.completed,
      pd.id_store
      FROM processes_detail pd
      inner join stores s on pd.id_store=s.id
      inner join orders o on pd.id_order = o.id
      inner join customers c on c.id = o.id_customer
      where 1 = 1
      and pd.completed = false
      and ( ${store} IS NULL OR pd.id_store = ${store} )
    `;

    return this.connection.query(query);
  }

  async updateCompleted(id: any) {
    const query = `
    UPDATE processes_detail
      set completed = true
      where  1 = 1
      and id=${id}
    `;
    return this.connection.query(query);
  }
}
