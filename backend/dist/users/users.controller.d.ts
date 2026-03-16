import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    getAll(): import(".prisma/client").Prisma.PrismaPromise<{
        id: string;
        email: string;
        password: string;
        role: import(".prisma/client").$Enums.Role;
        deletedAt: Date | null;
        createdAt: Date;
    }[]>;
    getMe(user: any): import(".prisma/client").Prisma.Prisma__UserClient<{
        id: string;
        email: string;
        password: string;
        role: import(".prisma/client").$Enums.Role;
        deletedAt: Date | null;
        createdAt: Date;
    } | null, null, import("@prisma/client/runtime/library").DefaultArgs>;
    update(id: string, dto: UpdateUserDto): Promise<{
        id: string;
        email: string;
        password: string;
        role: import(".prisma/client").$Enums.Role;
        deletedAt: Date | null;
        createdAt: Date;
    }>;
    softDelete(id: string): Promise<{
        id: string;
        email: string;
        password: string;
        role: import(".prisma/client").$Enums.Role;
        deletedAt: Date | null;
        createdAt: Date;
    }>;
}
