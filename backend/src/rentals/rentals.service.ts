import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RentCarDto } from './dto/rent-car.dto';

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
      throw new BadRequestException('User already has an active rental');
    }

    // Check if car exists and is available
    const car = await this.prisma.car.findUnique({ where: { id: carId } });
    if (!car) {
      throw new NotFoundException('Car not found');
    }

    if (car.status !== 'AVAILABLE') {
      throw new BadRequestException('Car is not available for rental');
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

  async stopRental(userId: string, rentalId: string) {
    // Find the rental
    const rental = await this.prisma.rental.findUnique({
      where: { id: rentalId },
      include: { car: true }
    });

    if (!rental) {
      throw new NotFoundException('Rental not found');
    }

    if (rental.userId !== userId) {
      throw new BadRequestException('Cannot stop rental not owned by user');
    }

    if (rental.status !== 'ACTIVE') {
      throw new BadRequestException('Rental is not active');
    }

    const endDate = new Date();

    // Calculate total price based on rental duration
    const msPerMinute = 60 * 1000;
    const minuteCount = Math.ceil((endDate.getTime() - rental.startDate.getTime()) / msPerMinute);
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

  getActive() {
    return this.prisma.rental.findMany({
      where: { status: 'ACTIVE' },
      include: { user: true, car: true },
    });
  }

  getActiveRentals() {
    return this.prisma.rental.findMany({
      where: {
        status: 'ACTIVE',
      },
      include: {
        car: true,
        user: true,
      },
    });
  }
}
