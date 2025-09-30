import { Repository } from 'typeorm';
import { PostEntity } from './post.entity';
export declare class PostsService {
    private readonly postsRepo;
    constructor(postsRepo: Repository<PostEntity>);
    list(offset?: number, limit?: number): Promise<{
        items: PostEntity[];
        total: number;
        offset: number;
        limit: number;
    }>;
    create(title: string, content: string, authorUsername?: string | null): Promise<PostEntity>;
}
