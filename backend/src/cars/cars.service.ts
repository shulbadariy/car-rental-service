import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCarDto } from './dto/create-car.dto';
import { UpdateCarLocationDto } from './dto/update-car-location.dto';
import { UpdateCarDto } from './dto/update-car.dto';
import { Car, CarStatus, Prisma } from '@prisma/client';

const USER_PUBLIC_SELECT = {
  id: true,
  email: true,
  role: true,
  firstName: true,
  lastName: true,
  birthDate: true,
} as const;

@Injectable()
export class CarsService {
  constructor(private prisma: PrismaService) {}

  private canIncludeRented(includeRented: boolean, user?: { role?: string }) {
    return includeRented && user?.role === 'ADMIN';
  }

  private buildWhere(includeRented: boolean, user?: { role?: string }): Prisma.CarWhereInput {
    const canSeeRented = this.canIncludeRented(includeRented, user);
    return {
      deletedAt: null,
      ...(canSeeRented ? {} : { status: 'AVAILABLE' }),
    };
  }

  private async appendOwnActiveRentalCar(
    cars: Car[],
    user?: { userId?: string; role?: string },
  ): Promise<Car[]> {
    if (!user?.userId || user.role === 'ADMIN') {
      return cars;
    }

    const activeRental = await this.prisma.rental.findFirst({
      where: {
        userId: user.userId,
        status: 'ACTIVE',
      },
      include: {
        car: true,
      },
    });

    if (!activeRental?.car || activeRental.car.deletedAt !== null) {
      return cars;
    }

    if (cars.some((car) => car.id === activeRental.car.id)) {
      return cars;
    }

    return [activeRental.car, ...cars];
  }

  create(data: CreateCarDto) {
    return this.prisma.car.create({ data });
  }

  async remove(id: string) {
    const car = await this.prisma.car.findFirst({ where: { id, deletedAt: null } });
    if (!car) throw new NotFoundException('Car not found.');

    const activeRental = await this.prisma.rental.findFirst({
      where: {
        carId: id,
        endDate: null,
      },
    });

    if (activeRental) {
      throw new BadRequestException('Car cannot be deleted because it is currently rented.');
    }

    try {
      return await this.prisma.car.update({
        where: { id },
        data: { deletedAt: new Date() },
      });
    } catch (error: any) {
      // Map foreign key constraint violations to 400 instead of 500.
      if (error?.code === 'P2003') {
        throw new BadRequestException('Car cannot be deleted because it has related rentals.');
      }

      throw error;
    }
  }

  async updateCar(id: string, dto: UpdateCarDto) {
    const car = await this.prisma.car.findFirst({ where: { id, deletedAt: null } });
    if (!car) throw new NotFoundException('Car not found.');

    const { latitude, longitude, ...rest } = dto;

    return this.prisma.car.update({
      where: { id },
      data: {
        ...rest,
        lat: latitude ?? rest.lat,
        lng: longitude ?? rest.lng,
        status: dto.status as CarStatus,
      },
    });
  }

  async findAll(includeRented = false, user?: { userId?: string; role?: string }, includeOwnRental = true) {
    const canSeeRented = this.canIncludeRented(includeRented, user);

    const cars = await this.prisma.car.findMany({
      where: this.buildWhere(includeRented, user),
      orderBy: { createdAt: 'desc' },
    });

    if (canSeeRented) {
      return cars;
    }

    if (includeOwnRental) {
      return this.appendOwnActiveRentalCar(cars, user);
    }

    return cars;
  }

  getAllCarsForAdmin() {
    return this.prisma.car.findMany({
      where: { deletedAt: null },
      include: {
        rentals: {
          where: {
            status: 'ACTIVE',
          },
          include: {
            user: {
              select: USER_PUBLIC_SELECT,
            },
          },
        },
      },
    });
  }

  async getCarById(id: string, user?: { role?: string }) {
    const car = await this.prisma.car.findFirst({ where: { id, deletedAt: null } });

    if (!car) {
      return null;
    }

    const activeRental = await this.prisma.rental.findFirst({
      where: {
        carId: id,
        status: 'ACTIVE',
      },
      include: {
        user: {
          select: USER_PUBLIC_SELECT,
        },
      },
    });

    if (!activeRental) {
      return {
        ...car,
        activeRental: null,
      };
    }

    return {
      ...car,
      activeRental: {
        id: activeRental.id,
        ...(user?.role === 'ADMIN' ? { user: activeRental.user } : {}),
      },
    };
  }

  async search(q: string, includeRented = false, user?: { userId?: string; role?: string }, includeOwnRental = true) {
    const query = q?.trim();
    if (!query) return [];
    const lower = query.toLowerCase();

    const canSeeRented = this.canIncludeRented(includeRented, user);

    const cars = await this.prisma.car.findMany({
      where: {
        ...this.buildWhere(includeRented, user),
        OR: [
          { brand: { contains: lower, mode: 'insensitive' } },
          { model: { contains: lower, mode: 'insensitive' } },
        ],
      },
      orderBy: { createdAt: 'desc' },
    });

    if (canSeeRented) {
      return cars;
    }

    if (includeOwnRental) {
      return this.appendOwnActiveRentalCar(cars, user);
    }

    return cars;
  }

  async filter(params: {
    brand?: string;
    model?: string;
    year?: number;
    minStartPrice?: number;
    maxStartPrice?: number;
    minPricePerMinute?: number;
    maxPricePerMinute?: number;
  }, includeRented = false, user?: { userId?: string; role?: string }, includeOwnRental = true) {
    const canSeeRented = this.canIncludeRented(includeRented, user);
    const where: Prisma.CarWhereInput = this.buildWhere(includeRented, user);
    if (params.brand) where.brand = { contains: params.brand, mode: 'insensitive' };
    if (params.model) where.model = { contains: params.model, mode: 'insensitive' };
    if (params.year) where.year = params.year;
    if (params.minStartPrice || params.maxStartPrice) {
      where.startPrice = {};
      if (params.minStartPrice) where.startPrice.gte = params.minStartPrice;
      if (params.maxStartPrice) where.startPrice.lte = params.maxStartPrice;
    }
    if (params.minPricePerMinute || params.maxPricePerMinute) {
      where.pricePerMinute = {};
      if (params.minPricePerMinute) where.pricePerMinute.gte = params.minPricePerMinute;
      if (params.maxPricePerMinute) where.pricePerMinute.lte = params.maxPricePerMinute;
    }
    const cars = await this.prisma.car.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    if (canSeeRented) {
      return cars;
    }

    if (includeOwnRental) {
      return this.appendOwnActiveRentalCar(cars, user);
    }

    return cars;
  }

  async getFilterOptions() {
    const cars = await this.prisma.car.findMany({
      where: { deletedAt: null },
    });

    const brands = [...new Set(cars.map((c) => c.brand))];
    const models = [...new Set(cars.map((c) => c.model))];
    const years = [...new Set(cars.map((c) => c.year))];

    return {
      brands,
      models,
      years,
    };
  }

  async updateLocation(id: string, dto: UpdateCarLocationDto) {
    const car = await this.prisma.car.findFirst({ where: { id, deletedAt: null } });
    if (!car) throw new NotFoundException('Car not found.');
    return this.prisma.car.update({ where: { id }, data: { lat: dto.lat, lng: dto.lng } });
  }

  async findNear(lat: number, lng: number, radius: number) {
    if (![5, 10, 15].includes(radius)) {
      throw new BadRequestException('Please select a radius of 5, 10, or 15 km.');
    }

    const cars = await this.prisma.car.findMany({
      where: {
        deletedAt: null,
      },
    });

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
