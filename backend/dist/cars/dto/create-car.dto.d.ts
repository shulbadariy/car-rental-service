import { CarStatus } from '@prisma/client';
export declare class CreateCarDto {
    brand: string;
    model: string;
    year: number;
    startPrice: number;
    pricePerMinute: number;
    lat: number;
    lng: number;
    status: CarStatus;
}
