import { Repository } from 'typeorm';
import { UserEntity } from './user.entity';
export declare class UsersService {
    private readonly usersRepo;
    constructor(usersRepo: Repository<UserEntity>);
    list(offset?: number, limit?: number): Promise<{
        items: UserEntity[];
        total: number;
        offset: number;
        limit: number;
    }>;
    findOne(id: number): Promise<Omit<UserEntity, 'passwordHash'>>;
    findByEmail(email: string): Promise<UserEntity | null>;
    findByUsername(username: string): Promise<UserEntity | null>;
    create(username: string, email: string, passwordHash: string): Promise<UserEntity>;
    update(id: number, username?: string, email?: string, password?: string, currentPassword?: string, profilePictureUrl?: string): Promise<Omit<UserEntity, 'passwordHash'>>;
    remove(id: number): Promise<{
        message: string;
    }>;
}
