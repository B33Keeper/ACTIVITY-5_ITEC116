import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { PostsService } from './posts.service';

class CreatePostDto { title!: string; content!: string; authorUsername?: string }

@ApiTags('posts')
@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Get()
  @ApiQuery({ name: 'offset', required: false, schema: { default: 0, type: 'number' } })
  @ApiQuery({ name: 'limit', required: false, schema: { default: 10, type: 'number' } })
  list(@Query('offset') offset = 0, @Query('limit') limit = 10) {
    return this.postsService.list(Number(offset), Number(limit));
  }

  @Post()
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  create(@Body() dto: CreatePostDto) {
    return this.postsService.create(dto.title, dto.content, dto.authorUsername ?? null);
  }
}


