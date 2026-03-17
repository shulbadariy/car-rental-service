import { CarsService } from './cars.service';
import { UpdateCarDto } from './dto/update-car.dto';
export declare class AdminCarsController {
    private readonly carsService;
    constructor(carsService: CarsService);
    findAllForAdmin(): import(".prisma/client").Prisma.PrismaPromise<({
        rentals: ({
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
        } & {
            id: string;
            status: import(".prisma/client").$Enums.RentalStatus;
            createdAt: Date;
            userId: string;
            carId: string;
            startDate: Date;
            endDate: Date | null;
            totalPrice: number;
        })[];
    } & {
        id: string;
        brand: string;
        model: string;
        year: number;
        startPrice: number;
        pricePerMinute: number;
        status: import(".prisma/client").$Enums.CarStatus;
        lat: number;
        lng: number;
        createdAt: Date;
    })[]>;
    update(id: string, dto: UpdateCarDto): Promise<{
        id: string;
        brand: string;
        model: string;
        year: number;
        startPrice: number;
        pricePerMinute: number;
        status: import(".prisma/client").$Enums.CarStatus;
        lat: number;
        lng: number;
        createdAt: Date;
    }>;
}
