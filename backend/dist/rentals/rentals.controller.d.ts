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
        status: import(".prisma/client").$Enums.RentalStatus;
        totalPrice: number;
        createdAt: Date;
        userId: string;
        carId: string;
    }>;
    startRental(user: any, dto: RentCarDto): Promise<{
        id: string;
        startDate: Date;
        endDate: Date | null;
        status: import(".prisma/client").$Enums.RentalStatus;
        totalPrice: number;
        createdAt: Date;
        userId: string;
        carId: string;
    }>;
    stopRental(user: any, dto: ReturnCarDto): Promise<{
        id: string;
        startDate: Date;
        endDate: Date | null;
        status: import(".prisma/client").$Enums.RentalStatus;
        totalPrice: number;
        createdAt: Date;
        userId: string;
        carId: string;
    }>;
    my(user: any): Promise<{
        currentRental: {
            id: string;
            startTime: Date;
            car: {
                id: string;
                status: import(".prisma/client").$Enums.CarStatus;
                createdAt: Date;
                brand: string;
                model: string;
                year: number;
                startPrice: number;
                pricePerMinute: number;
                lat: number;
                lng: number;
            };
        } | null;
        history: ({
            car: {
                id: string;
                status: import(".prisma/client").$Enums.CarStatus;
                createdAt: Date;
                brand: string;
                model: string;
                year: number;
                startPrice: number;
                pricePerMinute: number;
                lat: number;
                lng: number;
            };
        } & {
            id: string;
            startDate: Date;
            endDate: Date | null;
            status: import(".prisma/client").$Enums.RentalStatus;
            totalPrice: number;
            createdAt: Date;
            userId: string;
            carId: string;
        })[];
    }>;
    active(): import(".prisma/client").Prisma.PrismaPromise<({
        user: {
            id: string;
            createdAt: Date;
            firstName: string;
            lastName: string;
            birthDate: Date | null;
            email: string;
            password: string;
            role: import(".prisma/client").$Enums.Role;
            deletedAt: Date | null;
        };
        car: {
            id: string;
            status: import(".prisma/client").$Enums.CarStatus;
            createdAt: Date;
            brand: string;
            model: string;
            year: number;
            startPrice: number;
            pricePerMinute: number;
            lat: number;
            lng: number;
        };
    } & {
        id: string;
        startDate: Date;
        endDate: Date | null;
        status: import(".prisma/client").$Enums.RentalStatus;
        totalPrice: number;
        createdAt: Date;
        userId: string;
        carId: string;
    })[]>;
}
