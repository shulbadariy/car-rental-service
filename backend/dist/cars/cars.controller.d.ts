import { CarsService } from './cars.service';
import { CreateCarDto } from './dto/create-car.dto';
import { UpdateCarLocationDto } from './dto/update-car-location.dto';
export declare class CarsController {
    private readonly carsService;
    constructor(carsService: CarsService);
    create(dto: CreateCarDto): import(".prisma/client").Prisma.Prisma__CarClient<{
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
    filter(brand?: string, model?: string, year?: string, status?: string, dailyRateMin?: string, dailyRateMax?: string): Promise<{
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
    near(lat: string, lng: string, radius: string): Promise<{
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
