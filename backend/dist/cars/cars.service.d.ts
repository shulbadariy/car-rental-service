import { PrismaService } from '../prisma/prisma.service';
import { CreateCarDto } from './dto/create-car.dto';
import { UpdateCarLocationDto } from './dto/update-car-location.dto';
import { UpdateCarDto } from './dto/update-car.dto';
export declare class CarsService {
    private prisma;
    constructor(prisma: PrismaService);
    create(data: CreateCarDto): import(".prisma/client").Prisma.Prisma__CarClient<{
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
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
    remove(id: string): Promise<{
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
    updateCar(id: string, dto: UpdateCarDto): Promise<{
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
    findAll(q?: string): Promise<{
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
    }[]>;
    findAllIncludingRented(): import(".prisma/client").Prisma.PrismaPromise<{
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
    }[]>;
    getAllCarsForAdmin(): import(".prisma/client").Prisma.PrismaPromise<({
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
    findOne(id: string): import(".prisma/client").Prisma.Prisma__CarClient<{
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
    } | null, null, import("@prisma/client/runtime/library").DefaultArgs>;
    getCarById(id: string): import(".prisma/client").Prisma.Prisma__CarClient<{
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
    } | null, null, import("@prisma/client/runtime/library").DefaultArgs>;
    search(q: string): Promise<{
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
    }[]>;
    filter(params: {
        brand?: string;
        model?: string;
        year?: number;
        minStartPrice?: number;
        maxStartPrice?: number;
        minPricePerMinute?: number;
        maxPricePerMinute?: number;
    }): Promise<{
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
    }[]>;
    getFilterOptions(): Promise<{
        brands: string[];
        models: string[];
        years: number[];
    }>;
    updateLocation(id: string, dto: UpdateCarLocationDto): Promise<{
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
    findNear(lat: number, lng: number, radius: number): Promise<{
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
    }[]>;
}
