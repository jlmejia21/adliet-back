import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { EmailService } from './email.service';

@ApiTags('Email')
@Controller('email')
export class EmailController {
  constructor(private readonly emailService: EmailService) {}
  @Get()
  async readInbox() {
    // console.time('Proceso de 500 registros');
    const result = await this.emailService.getEmails();
    // console.timeEnd('Proceso de 500 registros');
    return {
      message: 'Peticion correcta ',
      result: result,
    };
  }
}
