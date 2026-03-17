import { Role } from '@prisma/client';
export declare class UpdateUserDto {
    firstName: string;
    lastName: string;
    birthDate?: string;
    email?: string;
    role?: Role;
}
