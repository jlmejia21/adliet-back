import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateEventDto, EditEventDto } from './dtos';
import { Event } from './entities';

@Injectable()
export class EventService {
  constructor(
    @InjectRepository(Event)
    private readonly eventRepository: Repository<Event>,
  ) {}

  async getMany(): Promise<Event[]> {
    return await this.eventRepository.find({
      order: {
        id: 'DESC',
      },
    });
  }

  async getOne(id: number) {
    const post = await this.eventRepository.findOne({
      where: { id: id },
    });
    if (!post) throw new NotFoundException('Post does not exist');
    return post;
  }

  async createOne(dto: CreateEventDto) {
    const post = this.eventRepository.create(dto as Event);
    return await this.eventRepository.save(post);
  }

  async editOne(id: number, dto: EditEventDto) {
    const event = await this.eventRepository.findOne({
      where: { id: id },
    });
    if (!event) throw new NotFoundException('Event does not exist');
    const editedEvent = Object.assign(event, dto);
    return await this.eventRepository.save(editedEvent);
  }

  async deleteOne(id: number) {
    return await this.eventRepository.delete(id);
  }
}
