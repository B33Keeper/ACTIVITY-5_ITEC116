import { AuthService } from './auth.service';
declare class RegisterDto {
    username: string;
    email: string;
    password: string;
}
declare class LoginDto {
    email: string;
    password: string;
}
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    register(dto: RegisterDto): Promise<{
        id: number;
        email: string;
    }>;
    login(dto: LoginDto): Promise<{
        access_token: string;
        username: string;
    }>;
}
export {};
