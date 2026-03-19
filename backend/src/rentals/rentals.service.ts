import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Role } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

const USER_PUBLIC_SELECT = {
  id: true,
  email: true,
  role: true,
  firstName: true,
  lastName: true,
  birthDate: true,
} as const;

@Injectable()
export class RentalsService {
  constructor(private prisma: PrismaService) {}

  async startRental(userId: string, carId: string) {
    // Check if user already has an active rental
    const activeRental = await this.prisma.rental.findFirst({
      where: {
        userId,
        status: 'ACTIVE',
      },
    });
    if (activeRental) {
      throw new BadRequestException('You already have an active rental.');
    }

    // Check if car exists and is available
    const car = await this.prisma.car.findFirst({
      where: {
        id: carId,
        deletedAt: null,
      },
    });
    if (!car) {
      throw new NotFoundException('Car not found.');
    }

    if (car.status !== 'AVAILABLE') {
      throw new BadRequestException('This car is not available right now.');
    }

    // Create rental record
    const rental = await this.prisma.rental.create({
      data: {
        userId,
        carId,
        startDate: new Date(),
        endDate: null,
        status: 'ACTIVE',
        totalPrice: 0, // Will be calculated when rental ends
      },
    });

    // Update car status to RENTED
    await this.prisma.car.update({
      where: { id: carId },
      data: { status: 'RENTED' }
    });

    return rental;
  }

  async stopRental(userId: string, rentalId: string, role?: Role | string) {
    // Find the rental
    const rental = await this.prisma.rental.findUnique({
      where: { id: rentalId },
      include: { car: true }
    });

    if (!rental) {
      throw new NotFoundException('Rental not found.');
    }

    const isAdmin = role === Role.ADMIN || role === Role.SUPERADMIN;

    if (rental.userId !== userId && !isAdmin) {
      throw new BadRequestException('You can only stop your own rental.');
    }

    if (rental.status !== 'ACTIVE') {
      throw new BadRequestException('This rental is already closed.');
    }

    const endDate = new Date();

    // Calculate total price based on rental duration (first minute is free)
    const msPerMinute = 60 * 1000;
    const rawMinutes = Math.ceil((endDate.getTime() - rental.startDate.getTime()) / msPerMinute);
    const minuteCount = Math.max(0, rawMinutes - 1);
    const totalPrice = rental.car.startPrice + minuteCount * rental.car.pricePerMinute;

    // Update rental
    const updatedRental = await this.prisma.rental.update({
      where: { id: rentalId },
      data: {
        endDate,
        status: 'FINISHED',
        totalPrice,
      },
    });

    // Update car status to AVAILABLE
    await this.prisma.car.update({
      where: { id: rental.carId },
      data: { status: 'AVAILABLE' }
    });

    return updatedRental;
  }

  async forceStopRental(rentalId: string) {
    const rental = await this.prisma.rental.findUnique({
      where: { id: rentalId },
      include: { car: true },
    });

    if (!rental) {
      throw new NotFoundException('Rental not found.');
    }

    if (rental.status !== 'ACTIVE') {
      throw new BadRequestException('Rental already finished.');
    }

    const endDate = new Date();

    const msPerMinute = 60 * 1000;
    const rawMinutes = Math.ceil((endDate.getTime() - rental.startDate.getTime()) / msPerMinute);
    const minuteCount = Math.max(0, rawMinutes - 1);

    const totalPrice = rental.car.startPrice + minuteCount * rental.car.pricePerMinute;

    await this.prisma.rental.update({
      where: { id: rentalId },
      data: {
        status: 'FINISHED',
        endDate,
        totalPrice,
      },
    });

    await this.prisma.car.update({
      where: { id: rental.carId },
      data: { status: 'AVAILABLE' },
    });

    return { success: true };
  }

  async getMy(userId: string) {
    // Get current active rental (include car pricing info for live cost calculation)
    const currentRental = await this.prisma.rental.findFirst({
      where: {
        userId,
        status: 'ACTIVE'
      },
      include: {
        car: true,
      }
    });

    const formattedCurrentRental = currentRental
      ? {
          id: currentRental.id,
          startTime: currentRental.startDate,
          car: currentRental.car,
        }
      : null;

    // Get rental history (finished rentals)
    const history = await this.prisma.rental.findMany({
      where: {
        userId,
        status: 'FINISHED'
      },
      orderBy: { createdAt: 'desc' },
      include: {
        car: true,
      }
    });

    return {
      currentRental: formattedCurrentRental,
      history
    };
  }

  getActiveRentals() {
    return this.prisma.rental.findMany({
      where: {
        status: 'ACTIVE',
      },
      include: {
        car: true,
        user: {
          select: USER_PUBLIC_SELECT,
        },
      },
    });
  }
}
