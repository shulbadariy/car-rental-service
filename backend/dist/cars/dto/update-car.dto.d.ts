import { CarStatus } from '@prisma/client';
export declare class UpdateCarDto {
    brand?: string;
    model?: string;
    year?: number;
    startPrice?: number;
    pricePerMinute?: number;
    lat?: number;
    latitude?: number;
    lng?: number;
    longitude?: number;
    status?: CarStatus;
}
