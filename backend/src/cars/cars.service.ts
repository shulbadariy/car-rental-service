import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCarDto } from './dto/create-car.dto';
import { UpdateCarLocationDto } from './dto/update-car-location.dto';
import { CarStatus } from '@prisma/client';

@Injectable()
export class CarsService {
  constructor(private prisma: PrismaService) {}

  create(data: CreateCarDto) {
    return this.prisma.car.create({ data });
  }

  async remove(id: string) {
    const car = await this.prisma.car.findUnique({ where: { id } });
    if (!car) throw new NotFoundException('Car not found');
    return this.prisma.car.delete({ where: { id } });
  }

  findAll(q?: string) {
    if (q) {
      return this.search(q);
    }
    return this.prisma.car.findMany();
  }

  findOne(id: string) {
    return this.prisma.car.findUnique({ where: { id } });
  }

  async search(q: string) {
    const query = q?.trim();
    if (!query) return [];
    const lower = query.toLowerCase();
    return this.prisma.car.findMany({
      where: {
        OR: [
          { brand: { contains: lower, mode: 'insensitive' } },
          { model: { contains: lower, mode: 'insensitive' } },
        ],
      },
    });
  }

  async filter(params: {
    brand?: string;
    model?: string;
    year?: number;
    status?: CarStatus;
    dailyRateMin?: number;
    dailyRateMax?: number;
  }) {
    const where: any = {};
    if (params.brand) where.brand = { equals: params.brand, mode: 'insensitive' };
    if (params.model) where.model = { equals: params.model, mode: 'insensitive' };
    if (params.year) where.year = params.year;
    if (params.status) where.status = params.status;
    if (params.dailyRateMin || params.dailyRateMax) {
      where.dailyRate = {};
      if (params.dailyRateMin) where.dailyRate.gte = params.dailyRateMin;
      if (params.dailyRateMax) where.dailyRate.lte = params.dailyRateMax;
    }
    return this.prisma.car.findMany({ where });
  }

  async updateLocation(id: string, dto: UpdateCarLocationDto) {
    const car = await this.prisma.car.findUnique({ where: { id } });
    if (!car) throw new NotFoundException('Car not found');
    return this.prisma.car.update({ where: { id }, data: { lat: dto.lat, lng: dto.lng } });
  }

  async findNear(lat: number, lng: number, radius: number) {
    if (![5, 10, 15].includes(radius)) {
      throw new BadRequestException('Radius must be one of 5, 10, 15 km');
    }

    const cars = await this.prisma.car.findMany();

    const toRad = (deg: number) => (deg * Math.PI) / 180;
    const earthRadiusKm = 6371;

    const within = cars.filter((car) => {
      const dLat = toRad(car.lat - lat);
      const dLng = toRad(car.lng - lng);
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat)) * Math.cos(toRad(car.lat)) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      const distance = earthRadiusKm * c;
      return distance <= radius;
    });

    return within;
  }
}
