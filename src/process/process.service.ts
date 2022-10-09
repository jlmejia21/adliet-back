import { MailerService } from '@nestjs-modules/mailer';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as Excel from 'exceljs';
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
    private mailerService: MailerService,
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

  async sendEmail(dto) {
    const { id } = dto;
    const filename = `Procesing_${id}.xlsx`;
    const workbook = new Excel.Workbook();
    const worksheet = workbook.addWorksheet(`Procesing_${id}`);

    const post = await this.processRepository.findOne({
      where: { id: id },
      relations: {
        orders: {
          store: true,
        },
      },
    });
    if (!post) throw new NotFoundException('Process does not exist');

    worksheet.columns = [
      { header: 'ID', key: 'id' },
      { header: 'LATITUD', key: 'latitude' },
      { header: 'LONGITUD', key: 'longitude' },
      { header: 'TIENDA ASIGNADA', key: 'assignedStore' },
      { header: 'CODIGO TIENDA', key: 'assignedStoreCode' },
      { header: 'TIENDA LATITUD', key: 'storeLatitude' },
      { header: 'TIENDA LONGITUD', key: 'storeLongitude' },
    ];

    const data = post.orders.map((order) => {
      const obj = {
        id: order.code,
        latitude: order.latitude,
        longitude: order.longitude,
        assignedStore: order.store.name,
        assignedStoreCode: order.store.code,
        storeLatitude: order.store.latitude,
        storeLongitude: order.store.longitude,
      };

      return obj;
    });

    data.forEach((e) => {
      worksheet.addRow(e);
    });
    const buffer = await workbook.xlsx.writeBuffer();

    // transporter.sendMail({
    //   from: '"El proceso se asignaciones genero correctamente ✅" <adliet@falabella.com.pe>',
    //   to: 'u201525319@upc.edu.pe',
    //   subject: `Proceso #${id}`,
    //   html: `
    //   <p>Buenas tardes,</p>
    //   <p>Adjunto el reporte de asignaciones de pedidos.</p>
    //   <p>Saludos.</p>
    //   `,
    //   attachments: [
    //     {
    //       filename,
    //       content: buffer,
    //       contentType:
    //         'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    //     },
    //   ],
    // });

    this.mailerService.sendMail({
      from: '"El proceso se asignaciones genero correctamente ✅" <adliet@falabella.com.pe>',
      to: 'u201525319@upc.edu.pe',
      subject: `Proceso #${id}`,
      html: `
        <p>Buenas tardes,</p>
        <p>Adjunto el reporte de asignaciones de pedidos.</p>
        <p>Saludos.</p>
        `,
      attachments: [
        {
          filename,
          content: buffer,
          contentType:
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        },
      ],
    });
  }
}
