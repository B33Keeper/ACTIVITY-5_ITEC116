import { PostsService } from './posts.service';
declare class CreatePostDto {
    title: string;
    content: string;
    authorUsername?: string;
}
export declare class PostsController {
    private readonly postsService;
    constructor(postsService: PostsService);
    list(offset?: number, limit?: number): Promise<{
        items: import("./post.entity").PostEntity[];
        total: number;
        offset: number;
        limit: number;
    }>;
    create(dto: CreatePostDto): Promise<import("./post.entity").PostEntity>;
}
export {};
