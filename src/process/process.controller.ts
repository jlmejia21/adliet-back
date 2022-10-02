import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ProcessService } from './process.service';

@ApiTags('Processes')
@Controller('process')
export class ProcessController {
  constructor(private readonly processService: ProcessService) {}

  @Get()
  async getMany() {
    const data = await this.processService.getMany();
    return {
      message: 'Peticion correcta',
      data,
    };
  }

  @Get(':id')
  getOne(@Param('id', ParseIntPipe) id: number) {
    return this.processService.getOne(id);
  }

  @Post('sendEmail')
  async sendEmail(@Body() id) {
    await this.processService.sendEmail(id);
    return {
      message: 'Se envio la notificacion satisfactoriamente.',
    };
  }

  @Post()
  createOne(@Body() dto) {
    return this.processService.createOne(dto);
  }

  @Delete(':id')
  deleteOne(@Param('id', ParseIntPipe) id: number) {
    return this.processService.deleteOne(id);
  }
}
