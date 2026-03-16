import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
export declare class AuthService {
    private prisma;
    private jwtService;
    constructor(prisma: PrismaService, jwtService: JwtService);
    register(dto: RegisterDto): Promise<{
        id: string;
        email: string;
        role: import(".prisma/client").$Enums.Role;
    }>;
    validateUser(email: string, pass: string): Promise<{
        id: string;
        email: string;
        role: import(".prisma/client").$Enums.Role;
        deletedAt: Date | null;
        createdAt: Date;
    } | null>;
    login(user: any): Promise<{
        accessToken: string;
    }>;
}
