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
import { ApiTags } from '@nestjs/swagger';
import { Auth } from 'src/auth/common/decorators';
import { CreateEventDto, EditEventDto } from './dtos';
import { EventService } from './event.service';

@ApiTags('Events')
@Controller('event')
export class EventController {
  constructor(private readonly eventService: EventService) {}

  @Get()
  async getMany() {
    const data = await this.eventService.getMany();
    return {
      message: 'Peticion correcta',
      data,
    };
  }

  @Get(':id')
  getOne(@Param('id', ParseIntPipe) id: number) {
    return this.eventService.getOne(id);
  }

  @Auth()
  @Post()
  createOne(@Body() dto: CreateEventDto) {
    return this.eventService.createOne(dto);
  }

  @Auth()
  @Put(':id')
  editOne(@Param('id', ParseIntPipe) id: number, @Body() dto: EditEventDto) {
    return this.eventService.editOne(id, dto);
  }

  @Auth()
  @Delete(':id')
  deleteOne(@Param('id', ParseIntPipe) id: number) {
    return this.eventService.deleteOne(id);
  }
}
