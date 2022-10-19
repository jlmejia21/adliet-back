import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { EmailService } from './email.service';

@ApiTags('Email')
@Controller('email')
export class EmailController {
  constructor(private readonly emailService: EmailService) {}
  @Get()
  async readInbox() {
    console.log('Test');
    console.time('Proceso');
    const result = await this.emailService.getEmails();
    console.timeEnd('Proceso');
    return {
      message: 'Peticion correcta ',
      result: result,
    };
  }
}
