import { UsersService } from './users.service';
declare class CreateUserDto {
    username: string;
    email: string;
    password: string;
}
declare class UpdateUserDto {
    username?: string;
    email?: string;
    password?: string;
}
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    list(offset?: number, limit?: number): Promise<{
        items: import("./user.entity").UserEntity[];
        total: number;
        offset: number;
        limit: number;
    }>;
    findOne(id: string): Promise<Omit<import("./user.entity").UserEntity, "passwordHash">>;
    create(dto: CreateUserDto): {
        message: string;
    };
    getProfile(req: any): Promise<Omit<import("./user.entity").UserEntity, "passwordHash">>;
    updateProfile(req: any, body: any, file?: Express.Multer.File): Promise<Omit<import("./user.entity").UserEntity, "passwordHash">>;
    update(id: string, dto: UpdateUserDto): Promise<Omit<import("./user.entity").UserEntity, "passwordHash">>;
    remove(id: string): Promise<{
        message: string;
    }>;
}
export {};
