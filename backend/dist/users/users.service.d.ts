import { PrismaService } from '../prisma/prisma.service';
import { UpdateUserDto } from './dto/update-user.dto';
export declare class UsersService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(): import(".prisma/client").Prisma.PrismaPromise<{
        id: string;
        createdAt: Date;
        email: string;
        password: string;
        role: import(".prisma/client").$Enums.Role;
        deletedAt: Date | null;
    }[]>;
    findOne(id: string): import(".prisma/client").Prisma.Prisma__UserClient<{
        id: string;
        createdAt: Date;
        email: string;
        password: string;
        role: import(".prisma/client").$Enums.Role;
        deletedAt: Date | null;
    } | null, null, import("@prisma/client/runtime/library").DefaultArgs>;
    findMe(userId: string): import(".prisma/client").Prisma.Prisma__UserClient<{
        id: string;
        createdAt: Date;
        email: string;
        password: string;
        role: import(".prisma/client").$Enums.Role;
        deletedAt: Date | null;
    } | null, null, import("@prisma/client/runtime/library").DefaultArgs>;
    update(id: string, dto: UpdateUserDto): Promise<{
        id: string;
        createdAt: Date;
        email: string;
        password: string;
        role: import(".prisma/client").$Enums.Role;
        deletedAt: Date | null;
    }>;
    softDelete(id: string): Promise<{
        id: string;
        createdAt: Date;
        email: string;
        password: string;
        role: import(".prisma/client").$Enums.Role;
        deletedAt: Date | null;
    }>;
}
