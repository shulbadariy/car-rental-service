import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
export declare class AdminUsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    getAllUsers(): import(".prisma/client").Prisma.PrismaPromise<{
        id: string;
        firstName: string;
        lastName: string;
        birthDate: Date | null;
        email: string;
        password: string;
        role: import(".prisma/client").$Enums.Role;
        deletedAt: Date | null;
        createdAt: Date;
    }[]>;
    getAdmins(): import(".prisma/client").Prisma.PrismaPromise<{
        id: string;
        firstName: string;
        lastName: string;
        birthDate: Date | null;
        email: string;
        password: string;
        role: import(".prisma/client").$Enums.Role;
        deletedAt: Date | null;
        createdAt: Date;
    }[]>;
    updateUser(id: string, dto: UpdateUserDto): Promise<{
        id: string;
        firstName: string;
        lastName: string;
        birthDate: Date | null;
        email: string;
        password: string;
        role: import(".prisma/client").$Enums.Role;
        deletedAt: Date | null;
        createdAt: Date;
    }>;
    deleteUser(id: string): Promise<{
        message: string;
    }>;
}
