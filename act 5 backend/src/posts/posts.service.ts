import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PostEntity } from './post.entity';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(PostEntity)
    private readonly postsRepo: Repository<PostEntity>,
  ) {}

  async list(offset = 0, limit = 10) {
    const [items, total] = await this.postsRepo.findAndCount({
      order: { createdAt: 'DESC' },
      skip: offset,
      take: limit,
    });
    return { items, total, offset, limit };
  }

  async create(title: string, content: string, authorUsername?: string | null) {
    const post = this.postsRepo.create({ title, content, authorUsername: authorUsername ?? null });
    return this.postsRepo.save(post);
  }
}


