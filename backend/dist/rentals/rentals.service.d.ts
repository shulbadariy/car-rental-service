import { PrismaService } from '../prisma/prisma.service';
export declare class RentalsService {
    private prisma;
    constructor(prisma: PrismaService);
    startRental(userId: string, carId: string): Promise<{
        id: string;
        startDate: Date;
        endDate: Date | null;
        status: import(".prisma/client").$Enums.RentalStatus;
        totalPrice: number;
        createdAt: Date;
        userId: string;
        carId: string;
    }>;
    stopRental(userId: string, rentalId: string): Promise<{
        id: string;
        startDate: Date;
        endDate: Date | null;
        status: import(".prisma/client").$Enums.RentalStatus;
        totalPrice: number;
        createdAt: Date;
        userId: string;
        carId: string;
    }>;
    getMy(userId: string): Promise<{
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
    getActive(): import(".prisma/client").Prisma.PrismaPromise<({
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
    getActiveRentals(): import(".prisma/client").Prisma.PrismaPromise<({
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
