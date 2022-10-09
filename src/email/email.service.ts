import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Excel from 'exceljs';
import * as Imap from 'imap';
import { simpleParser } from 'mailparser';
import {
  EMAIL_HOST_READ,
  EMAIL_PASSWORD,
  EMAIL_USER,
} from 'src/config/constants';

@Injectable()
export class EmailService {
  constructor(private config: ConfigService) {}
  imapConfig = {
    user: this.config.get<string>(EMAIL_USER),
    password: this.config.get<string>(EMAIL_PASSWORD),
    host: this.config.get<string>(EMAIL_HOST_READ),
    port: 993,
    tls: true,
    tlsOptions: { rejectUnauthorized: false },
  };

  getEmails() {
    try {
      const imap = new Imap(this.imapConfig);

      return new Promise((resolve, reject) => {
        imap.once('ready', () => {
          imap.openBox('INBOX', false, () => {
            imap.search(
              ['UNSEEN', ['SINCE', new Date()]],
              (err, results: any[]) => {
                if (results.length === 0) {
                  console.log('No hacer nada');
                  imap.end();
                  resolve([]);
                  return;
                }
                const f = imap.fetch(results, { bodies: '' });
                f.on('message', (msg) => {
                  msg.on('body', (stream) => {
                    simpleParser(stream, async (err, parsed) => {
                      resolve(this.parseObj(parsed));
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
          console.log(err);
        });

        imap.once('end', () => {
          console.log('Connection ended');
        });

        imap.connect();
      });
    } catch (ex) {
      console.log(ex);
      console.log('an error occurred');
    }
  }

  async parseObj(parsed) {
    console.log('Subject:', parsed.subject);
    console.log('From:', parsed.from);
    console.log('Text:', parsed.text);
    console.log('TextAsHtml:', parsed.textAsHtml);
    const dataAttachment = await this.getAttchament(parsed.attachments);
    console.log(dataAttachment);
    return dataAttachment;
  }

  async getAttchament(attachments: any[]) {
    const data = [];
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
}
