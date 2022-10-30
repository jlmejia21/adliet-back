import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CreateEventDto, EditEventDto } from 'src/event/dtos';
import { EventCategory } from 'src/event/enums';
import { EventDescription } from 'src/event/enums/event-description.enum';
import { EventService } from 'src/event/event.service';
import { EmailService } from './email.service';

@ApiTags('Email')
@Controller('email')
export class EmailController {
  constructor(
    private readonly emailService: EmailService,
    private readonly eventService: EventService,
  ) {}
  @Get()
  async readInbox() {
    const event = await this.eventService.createOne(
      this.initEvent(EventCategory.Inicio, EventDescription.Inicio, null),
    );

    const result = (await this.emailService.runReadInbox()) as any[];

    if (result.length === 0) {
      await this.eventService.createOne(
        this.initEvent(
          EventCategory.Incompleto,
          EventDescription.Incompleto,
          null,
          event.id,
        ),
      );
    } else {
      await this.eventService.editOne(
        event.id,
        this.updateProcessEventId(result[0].id),
      );

      await this.eventService.createOne(
        this.initEvent(
          EventCategory.Completado,
          EventDescription.Completado,
          result[0].id,
          event.id,
        ),
      );
    }

    return {
      message: 'Peticion correcta ',
      result: result,
    };
  }

  initEvent(
    category: EventCategory,
    description: EventDescription,
    processId: number | null,
    event_id_ref?: number | null,
  ) {
    const eventDTO = new CreateEventDto();
    eventDTO.category = category;
    eventDTO.description = description;
    eventDTO.process_id = processId;
    eventDTO.event_id_ref = event_id_ref ?? null;
    return eventDTO;
  }

  updateProcessEventId(id: number) {
    const eventDTO = new EditEventDto();
    eventDTO.process_id = id;
    return eventDTO;
  }
}
