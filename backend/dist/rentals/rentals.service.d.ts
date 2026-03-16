import { PrismaService } from '../prisma/prisma.service';
import { RentCarDto } from './dto/rent-car.dto';
export declare class RentalsService {
    private prisma;
    constructor(prisma: PrismaService);
    rent(userId: string, dto: RentCarDto): Promise<{
        id: string;
        startDate: Date;
        endDate: Date | null;
        totalPrice: number;
        createdAt: Date;
        userId: string;
        carId: string;
    }>;
    returnRental(userId: string, rentalId: string): Promise<{
        message: string;
    }>;
    getMy(userId: string): import(".prisma/client").Prisma.PrismaPromise<({
        car: {
            id: string;
            createdAt: Date;
            brand: string;
            model: string;
            year: number;
            dailyRate: number;
            status: import(".prisma/client").$Enums.CarStatus;
            lat: number;
            lng: number;
        };
    } & {
        id: string;
        startDate: Date;
        endDate: Date | null;
        totalPrice: number;
        createdAt: Date;
        userId: string;
        carId: string;
    })[]>;
    getActive(): import(".prisma/client").Prisma.PrismaPromise<({
        user: {
            id: string;
            createdAt: Date;
            email: string;
            password: string;
            role: import(".prisma/client").$Enums.Role;
            deletedAt: Date | null;
        };
        car: {
            id: string;
            createdAt: Date;
            brand: string;
            model: string;
            year: number;
            dailyRate: number;
            status: import(".prisma/client").$Enums.CarStatus;
            lat: number;
            lng: number;
        };
    } & {
        id: string;
        startDate: Date;
        endDate: Date | null;
        totalPrice: number;
        createdAt: Date;
        userId: string;
        carId: string;
    })[]>;
}
