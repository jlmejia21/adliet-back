import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateStoreDto, EditStoreDto } from './dtos';
import { Store } from './entities/store.entity';

@Injectable()
export class StoreService {
  constructor(
    @InjectRepository(Store)
    private readonly storeRepository: Repository<Store>,
  ) {}

  async getMany(): Promise<Store[]> {
    return await this.storeRepository.find();
  }
  async getOne(id: number) {
    const post = await this.storeRepository.findOne({
      where: { id: id },
    });
    if (!post) throw new NotFoundException('Post does not exist');
    return post;
  }
  async createOne(dto: CreateStoreDto) {
    const post = this.storeRepository.create(dto as any);
    return await this.storeRepository.save(post);
  }
  async editOne(id: number, dto: EditStoreDto) {
    const post = await this.storeRepository.findOne({
      where: { id: id },
    });
    if (!post) throw new NotFoundException('Store does not exist');
    const editedPost = Object.assign(post, dto);
    return await this.storeRepository.save(editedPost);
  }
  async deleteOne(id: number) {
    return await this.storeRepository.delete(id);
  }
}
