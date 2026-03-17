import { PrismaService } from '../prisma/prisma.service';
import { UpdateUserDto } from './dto/update-user.dto';
export declare class UsersService {
    private prisma;
    constructor(prisma: PrismaService);
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
    findOne(id: string): import(".prisma/client").Prisma.Prisma__UserClient<{
        id: string;
        firstName: string;
        lastName: string;
        birthDate: Date | null;
        email: string;
        password: string;
        role: import(".prisma/client").$Enums.Role;
        deletedAt: Date | null;
        createdAt: Date;
    } | null, null, import("@prisma/client/runtime/library").DefaultArgs>;
    findMe(userId: string): import(".prisma/client").Prisma.Prisma__UserClient<{
        id: string;
        firstName: string;
        lastName: string;
        birthDate: Date | null;
        email: string;
        password: string;
        role: import(".prisma/client").$Enums.Role;
        deletedAt: Date | null;
        createdAt: Date;
    } | null, null, import("@prisma/client/runtime/library").DefaultArgs>;
    getMe(userId: string): import(".prisma/client").Prisma.Prisma__UserClient<{
        id: string;
        firstName: string;
        lastName: string;
        birthDate: Date | null;
        email: string;
        password: string;
        role: import(".prisma/client").$Enums.Role;
        deletedAt: Date | null;
        createdAt: Date;
    } | null, null, import("@prisma/client/runtime/library").DefaultArgs>;
    update(id: string, dto: UpdateUserDto): Promise<{
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
    softDelete(id: string): Promise<{
        message: string;
    }>;
}
