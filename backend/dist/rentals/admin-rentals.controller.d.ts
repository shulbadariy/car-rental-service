import { RentalsService } from './rentals.service';
export declare class AdminRentalsController {
    private readonly rentalsService;
    constructor(rentalsService: RentalsService);
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
