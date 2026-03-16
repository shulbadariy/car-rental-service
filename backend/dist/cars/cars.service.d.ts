import { PrismaService } from '../prisma/prisma.service';
import { CreateCarDto } from './dto/create-car.dto';
import { UpdateCarLocationDto } from './dto/update-car-location.dto';
import { CarStatus } from '@prisma/client';
export declare class CarsService {
    private prisma;
    constructor(prisma: PrismaService);
    create(data: CreateCarDto): import(".prisma/client").Prisma.Prisma__CarClient<{
        id: string;
        brand: string;
        model: string;
        year: number;
        dailyRate: number;
        status: import(".prisma/client").$Enums.CarStatus;
        lat: number;
        lng: number;
        createdAt: Date;
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
    remove(id: string): Promise<{
        id: string;
        brand: string;
        model: string;
        year: number;
        dailyRate: number;
        status: import(".prisma/client").$Enums.CarStatus;
        lat: number;
        lng: number;
        createdAt: Date;
    }>;
    findAll(q?: string): Promise<{
        id: string;
        brand: string;
        model: string;
        year: number;
        dailyRate: number;
        status: import(".prisma/client").$Enums.CarStatus;
        lat: number;
        lng: number;
        createdAt: Date;
    }[]>;
    findOne(id: string): import(".prisma/client").Prisma.Prisma__CarClient<{
        id: string;
        brand: string;
        model: string;
        year: number;
        dailyRate: number;
        status: import(".prisma/client").$Enums.CarStatus;
        lat: number;
        lng: number;
        createdAt: Date;
    } | null, null, import("@prisma/client/runtime/library").DefaultArgs>;
    search(q: string): Promise<{
        id: string;
        brand: string;
        model: string;
        year: number;
        dailyRate: number;
        status: import(".prisma/client").$Enums.CarStatus;
        lat: number;
        lng: number;
        createdAt: Date;
    }[]>;
    filter(params: {
        brand?: string;
        model?: string;
        year?: number;
        status?: CarStatus;
        dailyRateMin?: number;
        dailyRateMax?: number;
    }): Promise<{
        id: string;
        brand: string;
        model: string;
        year: number;
        dailyRate: number;
        status: import(".prisma/client").$Enums.CarStatus;
        lat: number;
        lng: number;
        createdAt: Date;
    }[]>;
    updateLocation(id: string, dto: UpdateCarLocationDto): Promise<{
        id: string;
        brand: string;
        model: string;
        year: number;
        dailyRate: number;
        status: import(".prisma/client").$Enums.CarStatus;
        lat: number;
        lng: number;
        createdAt: Date;
    }>;
    findNear(lat: number, lng: number, radius: number): Promise<{
        id: string;
        brand: string;
        model: string;
        year: number;
        dailyRate: number;
        status: import(".prisma/client").$Enums.CarStatus;
        lat: number;
        lng: number;
        createdAt: Date;
    }[]>;
}
