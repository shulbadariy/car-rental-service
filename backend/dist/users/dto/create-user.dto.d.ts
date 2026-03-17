import { Role } from '@prisma/client';
export declare class CreateUserDto {
    firstName: string;
    lastName: string;
    birthDate?: string;
    email: string;
    password: string;
    role?: Role;
}
