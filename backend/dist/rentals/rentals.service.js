"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RentalsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let RentalsService = class RentalsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async startRental(userId, carId) {
        const activeRental = await this.prisma.rental.findFirst({
            where: {
                userId,
                status: 'ACTIVE',
            },
        });
        if (activeRental) {
            throw new common_1.BadRequestException('User already has an active rental');
        }
        const car = await this.prisma.car.findUnique({ where: { id: carId } });
        if (!car) {
            throw new common_1.NotFoundException('Car not found');
        }
        if (car.status !== 'AVAILABLE') {
            throw new common_1.BadRequestException('Car is not available for rental');
        }
        const rental = await this.prisma.rental.create({
            data: {
                userId,
                carId,
                startDate: new Date(),
                endDate: null,
                status: 'ACTIVE',
                totalPrice: 0,
            },
        });
        await this.prisma.car.update({
            where: { id: carId },
            data: { status: 'RENTED' }
        });
        return rental;
    }
    async stopRental(userId, rentalId) {
        const rental = await this.prisma.rental.findUnique({
            where: { id: rentalId },
            include: { car: true }
        });
        if (!rental) {
            throw new common_1.NotFoundException('Rental not found');
        }
        if (rental.userId !== userId) {
            throw new common_1.BadRequestException('Cannot stop rental not owned by user');
        }
        if (rental.status !== 'ACTIVE') {
            throw new common_1.BadRequestException('Rental is not active');
        }
        const endDate = new Date();
        const msPerMinute = 60 * 1000;
        const minuteCount = Math.ceil((endDate.getTime() - rental.startDate.getTime()) / msPerMinute);
        const totalPrice = rental.car.startPrice + minuteCount * rental.car.pricePerMinute;
        const updatedRental = await this.prisma.rental.update({
            where: { id: rentalId },
            data: {
                endDate,
                status: 'FINISHED',
                totalPrice,
            },
        });
        await this.prisma.car.update({
            where: { id: rental.carId },
            data: { status: 'AVAILABLE' }
        });
        return updatedRental;
    }
    async getMy(userId) {
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
};
exports.RentalsService = RentalsService;
exports.RentalsService = RentalsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], RentalsService);
//# sourceMappingURL=rentals.service.js.map