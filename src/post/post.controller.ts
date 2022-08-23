import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';

@Controller('post')
export class PostController {
  @Get()
  getMany() {
    return 'OK';
  }

  @Get(':id')
  getOne(@Param('id') id: number) {
    console.log('id:' + id);
    return {
      message: 'getOne',
    };
  }

  @Post()
  createOne(@Body('title') title: any, @Body('content') content: any) {
    console.log(title);
    console.log(content);
  }

  @Put(':id')
  editOne(@Param('id') id: number) {}

  @Delete(':id')
  deleteOne(@Param('id') id: number) {}
}
