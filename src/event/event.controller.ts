import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiTags } from '@nestjs/swagger';
import { CRON_EXPRESION } from 'src/config/constants';
import { CreateEventDto, EditEventDto } from './dtos';
import { EventService } from './event.service';

@ApiTags('Events')
@Controller('event')
export class EventController {
  constructor(
    private readonly eventService: EventService,
    private config: ConfigService,
  ) {}

  @Get()
  async getMany() {
    const data = await this.eventService.getMany();
    return {
      message: 'Peticion correcta',
      data,
    };
  }

  @Get('/job')
  getJob() {
    return {
      message: 'Peticion correcta',
      data: this.config.get<string>(CRON_EXPRESION),
    };
  }

  @Get(':id')
  getOne(@Param('id', ParseIntPipe) id: number) {
    return this.eventService.getOne(id);
  }

  @Post()
  createOne(@Body() dto: CreateEventDto) {
    return this.eventService.createOne(dto);
  }

  @Put(':id')
  editOne(@Param('id', ParseIntPipe) id: number, @Body() dto: EditEventDto) {
    return this.eventService.editOne(id, dto);
  }

  @Delete(':id')
  deleteOne(@Param('id', ParseIntPipe) id: number) {
    return this.eventService.deleteOne(id);
  }
}
