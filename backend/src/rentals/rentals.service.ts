import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RentCarDto } from './dto/rent-car.dto';

@Injectable()
export class RentalsService {
  constructor(private prisma: PrismaService) {}

  async rent(userId: string, dto: RentCarDto) {
    const now = new Date();
    const activeRental = await this.prisma.rental.findFirst({
      where: {
        userId,
        startDate: { lte: now },
        endDate: { gte: now },
      },
    });
    if (activeRental) {
      throw new BadRequestException('User already has an active rental');
    }

    const car = await this.prisma.car.findUnique({ where: { id: dto.carId } });
    if (!car) {
      throw new NotFoundException('Car not found');
    }

    if (car.status !== 'AVAILABLE') {
      throw new BadRequestException('Car must be AVAILABLE to rent');
    }

    const start = new Date(dto.startDate);
    const end = new Date(dto.endDate);
    if (end <= start) {
      throw new BadRequestException('endDate must be after startDate');
    }

    const msPerDay = 24 * 60 * 60 * 1000;
    const dayCount = Math.ceil((end.getTime() - start.getTime()) / msPerDay);
    const totalPrice = dayCount * car.dailyRate;

    const rental = await this.prisma.rental.create({
      data: {
        userId,
        carId: dto.carId,
        startDate: start,
        endDate: end,
        totalPrice,
      },
    });

    await this.prisma.car.update({ where: { id: car.id }, data: { status: 'RENTED' } });

    return rental;
  }

  async returnRental(userId: string, rentalId: string) {
    const rental = await this.prisma.rental.findUnique({ where: { id: rentalId } });
    if (!rental) {
      throw new NotFoundException('Rental not found');
    }

    if (rental.userId !== userId) {
      throw new BadRequestException('Cannot return rental not owned by user');
    }

    if (rental.endDate && rental.endDate <= new Date()) {
      // if already ended in past or current; but allow as return completion anyway.
    }

    const car = await this.prisma.car.findUnique({ where: { id: rental.carId } });
    if (!car) {
      throw new NotFoundException('Car not found');
    }

    await this.prisma.rental.update({
      where: { id: rentalId },
      data: {
        endDate: new Date(),
      },
    });

    await this.prisma.car.update({ where: { id: car.id }, data: { status: 'AVAILABLE' } });

    return { message: 'Car returned successfully' };
  }

  getMy(userId: string) {
    return this.prisma.rental.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        car: true
      }
    });
  }

  getActive() {
    return this.prisma.rental.findMany({
      where: { endDate: null },
      include: { user: true, car: true },
    });
  }
}
