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
import { CreatePostDto, EditPostDto } from './dtos';
import { PostService } from './post.service';

@ApiTags('Posts')
@Controller('post')
export class PostController {
  constructor(private readonly postService: PostService) {}

  @Get()
  async getMany() {
    const data = await this.postService.getMany();
    return {
      message: 'Peticion correcta',
      data,
    };
  }

  @Get(':id')
  getOne(@Param('id', ParseIntPipe) id: number) {
    return this.postService.getOne(id);
  }

  @Auth()
  @Post()
  createOne(@Body() dto: CreatePostDto) {
    return this.postService.createOne(dto);
  }

  @Auth()
  @Put(':id')
  editOne(@Param('id', ParseIntPipe) id: number, @Body() dto: EditPostDto) {
    return this.postService.editOne(id, dto);
  }

  @Auth()
  @Delete(':id')
  deleteOne(@Param('id', ParseIntPipe) id: number) {
    return this.postService.deleteOne(id);
  }
}
