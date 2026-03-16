import { RentalsService } from './rentals.service';
import { RentCarDto } from './dto/rent-car.dto';
import { ReturnCarDto } from './dto/return-car.dto';
export declare class RentalsController {
    private readonly rentalsService;
    constructor(rentalsService: RentalsService);
    rent(user: any, dto: RentCarDto): Promise<{
        id: string;
        startDate: Date;
        endDate: Date | null;
        totalPrice: number;
        createdAt: Date;
        userId: string;
        carId: string;
    }>;
    returnCar(user: any, dto: ReturnCarDto): Promise<{
        message: string;
    }>;
    my(user: any): import(".prisma/client").Prisma.PrismaPromise<({
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
    active(): import(".prisma/client").Prisma.PrismaPromise<({
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
