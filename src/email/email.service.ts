import { MailerService } from '@nestjs-modules/mailer';
import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron, CronExpression } from '@nestjs/schedule';
import * as Excel from 'exceljs';
import * as Imap from 'imap';
import { simpleParser } from 'mailparser';
import { lastValueFrom } from 'rxjs';
import {
  EMAIL_HOST_READ,
  EMAIL_PASSWORD,
  EMAIL_USER,
} from 'src/config/constants';
import { OrderService } from 'src/order/order.service';
import { ProcessService } from 'src/process/process.service';

@Injectable()
export class EmailService {
  constructor(
    private config: ConfigService,
    private processService: ProcessService,
    private orderService: OrderService,
    private mailerService: MailerService,
    private readonly http: HttpService,
  ) {}
  imapConfig = {
    user: this.config.get<string>(EMAIL_USER),
    password: this.config.get<string>(EMAIL_PASSWORD),
    host: this.config.get<string>(EMAIL_HOST_READ),
    port: 993,
    tls: true,
    tlsOptions: { rejectUnauthorized: false },
  };

  @Cron(CronExpression.EVERY_DAY_AT_11PM)
  log() {
    const logger = new Logger();
    logger.log('Cron example');
    // this.getEmails();
  }

  getEmails() {
    try {
      const imap = new Imap(this.imapConfig);

      return new Promise((resolve, reject) => {
        let emails = [];
        imap.once('ready', () => {
          imap.openBox('INBOX', false, () => {
            imap.search(
              ['UNSEEN', ['SINCE', new Date()]],
              async (err, results: any[]) => {
                if (results.length === 0) {
                  await this.sendEmailWithEmptyInbox();
                  imap.end();
                  resolve([]);
                  return;
                }
                const f = imap.fetch(results, { bodies: '' });
                f.on('message', (msg) => {
                  msg.on('body', (stream) => {
                    simpleParser(stream, (err, parsed) => {
                      this.toObjMail(parsed).then((email) => {
                        emails = [...emails, email];
                      });
                    });
                  });
                  msg.once('attributes', (attrs) => {
                    const { uid } = attrs;
                    imap.addFlags(uid, ['\\Seen'], () => {
                      console.log('Marked as read!');
                    });
                  });
                });

                f.once('error', (ex) => {
                  return Promise.reject(ex);
                });
                f.once('end', () => {
                  console.log('Done fetching all messages!');
                  imap.end();
                });
              },
            );
          });
        });

        imap.once('error', (err) => {
          console.log('error');
          reject(err);
          console.log(err);
        });

        imap.once('end', async () => {
          if (emails.length > 0) {
            const results = await this.validateService(emails);
            const processes = [];
            for (const result of results) {
              const mapOrders = this.mapOrders(result);
              const process = await this.processService.createOne(mapOrders);
              await this.processService.sendEmail(process);
              processes.push(process);
            }
            resolve(processes);
          }
          console.log('Connection ended');
        });

        imap.connect();
      });
    } catch (ex) {
      console.log(ex);
      console.log('an error occurred');
    }
  }

  async toObjMail(parsed: any) {
    const obj = { subject: '', from: '', text: '', attachments: [] };
    obj.subject = parsed.subject;
    obj.from = parsed.from;
    obj.text = parsed.text;
    if (parsed.attachments.length <= 0) {
      obj.attachments = [];
    } else {
      obj.attachments = await this.getAttchament(parsed.attachments);
    }
    return obj;
  }

  async getAttchament(attachments: any[]) {
    const data = [];
    if (
      attachments[0].contentType !==
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ) {
      return data;
    }
    const wb = new Excel.Workbook();
    const file = await wb.xlsx.load(attachments[0].content);
    const sheet = file.worksheets[0];
    const firstRow = sheet.getRow(1);
    const keys = firstRow.values;
    sheet.eachRow((row, rowNumber) => {
      if (rowNumber == 1) return;
      const values = row.values;
      const obj = {};
      for (let i = 1; i < keys.length; i++) {
        obj[keys[i]] = values[i];
      }
      data.push(obj);
    });

    return data;
  }

  validateService(emails: any[]) {
    if (!this.validateEmailWithSubjectWrong(emails))
      return this.sendEmailWithSubjectWrong();
    if (!this.validateEmailWithNoAttachment(emails))
      return this.sendEmailWithNoAttachment();
    if (!this.validateEmailWithAttachmentFormat(emails))
      return this.sendEmailWithAttachmentFormat();
    const assignations = this.assignLocation(emails);
    return Promise.resolve(assignations);
  }

  mapOrders(assignations: any[]) {
    let orders: any[] = [];
    assignations.forEach((r) => {
      const newOrders = r.orders.map((o: any) => {
        return {
          code: o.order,
          latitude: o.latitude,
          longitude: o.longitude,
          store_id: Number(r.store.id),
        };
      });
      orders = [...orders, ...newOrders];
    });
    return {
      numberOrders: orders.length,
      orders,
    };
  }

  async assignLocation(emails: any[]) {
    if (!(await this.validateIfAllOrdersExisted(emails))) {
      await this.sendEmailWithAllOrdersExisted();
      return [];
    }
    const url = 'http://127.0.0.1:5000/json';
    const assignations = [];
    for (const email of emails) {
      const { attachments } = email;
      const result = await lastValueFrom(this.http.post(url, attachments));
      assignations.push(result.data);
    }
    return assignations;
  }

  validateEmailWithSubjectWrong(emails: any[]) {
    let isValid = true;
    const filteredEmails = emails.filter(
      (email) => email.subject === 'Proceso asignacion de tiendas',
    );
    isValid = filteredEmails.length > 0;
    return isValid;
  }

  validateEmailWithNoAttachment(emails: any[]) {
    let isValid = true;
    const filteredEmails = emails.filter(
      (email) => email.attachments.length > 0,
    );
    isValid = filteredEmails.length > 0;
    return isValid;
  }

  validateEmailWithAttachmentFormat(emails: any[]) {
    let isValid = true;
    const headers = [
      'ID',
      'DEPARTAMENTO',
      'PROVINCIA',
      'DISTRITO',
      'DIRECCION',
      'TELEFONO',
      'AQUI_GEO_MANUAL',
    ];
    const filteredEmails = emails.filter(
      (email) => email.attachments.length > 0,
    );
    const mapFilteredEmails = filteredEmails.map((email) => {
      const keys = Object.keys(email.attachments[0]);
      const hasHeaders = keys.some((r) => headers.includes(r));
      return { ...email, isValid: hasHeaders };
    });
    const emailsValid = mapFilteredEmails.filter((email) => email.isValid);
    isValid = emailsValid.length > 0;
    return isValid;
  }

  async validateIfAllOrdersExisted(emails: any[]) {
    let isValid = true;

    const mapEmails = await Promise.all(
      emails.map(async (email) => {
        const codes = email.attachments.map((row) => row.ID) as any[];
        const ordersProcessed = await this.orderService.getOrdersByCodes({
          codes,
        });
        const notProceedOrders =
          email.attachments.length - ordersProcessed.length;
        return { ...email, isValid: notProceedOrders > 0 };
      }),
    );

    const emailsValid = mapEmails.filter((email) => email.isValid);
    isValid = emailsValid.length > 0;
    return isValid;
  }

  sendEmailWithEmptyInbox() {
    return this.mailerService.sendMail({
      from: '"El proceso de asignaciones no se genero correctamente ❌" <adliet@falabella.com.pe>',
      to: 'u201525319@upc.edu.pe',
      subject: `Proceso de asignaciones erróneo`,
      html: `
        <p>Buenas noches,</p>
        <p>El proceso de asignaciones no se ejecuto correctamente, ya que no se encontro ningun correo.</p>
        <p>Saludos.</p>
        `,
    });
  }

  sendEmailWithSubjectWrong() {
    return this.mailerService
      .sendMail({
        from: '"El proceso de asignaciones no se genero correctamente ❌" <adliet@falabella.com.pe>',
        to: 'u201525319@upc.edu.pe',
        subject: `Proceso de asignaciones erróneo`,
        html: `
        <p>Buenas noches,</p>
        <p>El proceso de asignaciones no se ejecuto correctamente, ya que no se encontro ningun correo con el asunto correcto.</p>
        <p>Saludos.</p>
        `,
      })
      .then(() => Promise.resolve([]));
  }

  sendEmailWithNoAttachment() {
    return this.mailerService
      .sendMail({
        from: '"El proceso de asignaciones no se genero correctamente ❌" <adliet@falabella.com.pe>',
        to: 'u201525319@upc.edu.pe',
        subject: `Proceso de asignaciones erróneo`,
        html: `
        <p>Buenas noches,</p>
        <p>El proceso de asignaciones no se ejecuto correctamente, ya que el correo no cuenta con ningun archivo adjunto excel.</p>
        <p>Saludos.</p>
        `,
      })
      .then(() => Promise.resolve([]));
  }

  sendEmailWithAttachmentFormat() {
    const headers = [
      'ID',
      'DEPARTAMENTO',
      'PROVINCIA',
      'DISTRITO',
      'DIRECCION',
      'TELEFONO',
      'AQUI_GEO_MANUAL',
    ];
    return this.mailerService
      .sendMail({
        from: '"El proceso de asignaciones no se genero correctamente ❌" <adliet@falabella.com.pe>',
        to: 'u201525319@upc.edu.pe',
        subject: `Proceso de asignaciones erróneo`,
        html: `
        <p>Buenas noches,</p>
        <p>El proceso no se ejecuto correctamente, ya que el archivo adjunto no cuenta el formato establecido: [${headers.toString()}].</p>
        <p>Saludos.</p>
        `,
      })
      .then(() => Promise.resolve([]));
  }

  sendEmailWithAllOrdersExisted() {
    return this.mailerService.sendMail({
      from: '"El proceso de asignaciones no se genero correctamente ❌" <adliet@falabella.com.pe>',
      to: 'u201525319@upc.edu.pe',
      subject: `Proceso de asignaciones erróneo`,
      html: `
        <p>Buenas noches,</p>
        <p>El proceso no se ejecuto correctamente, ya que todas los pedidos del excel ya se encuentran registrados.</p>
        <p>Saludos.</p>
        `,
    });
  }
}
