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
    findAll(q?: string, brand?: string, model?: string, year?: string, minStartPrice?: string, maxStartPrice?: string, minPricePerMinute?: string, maxPricePerMinute?: string): Promise<{
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
    getFilterOptions(): Promise<{
        brands: string[];
        models: string[];
        years: number[];
    }>;
    getAllCars(): import(".prisma/client").Prisma.PrismaPromise<{
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
    filter(brand?: string, model?: string, year?: string, minStartPrice?: string, maxStartPrice?: string, minPricePerMinute?: string, maxPricePerMinute?: string): Promise<{
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
    near(lat: string, lng: string, radius: string): Promise<{
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
}
