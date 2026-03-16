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
    async rent(userId, dto) {
        const now = new Date();
        const activeRental = await this.prisma.rental.findFirst({
            where: {
                userId,
                startDate: { lte: now },
                endDate: { gte: now },
            },
        });
        if (activeRental) {
            throw new common_1.BadRequestException('User already has an active rental');
        }
        const car = await this.prisma.car.findUnique({ where: { id: dto.carId } });
        if (!car) {
            throw new common_1.NotFoundException('Car not found');
        }
        if (car.status !== 'AVAILABLE') {
            throw new common_1.BadRequestException('Car must be AVAILABLE to rent');
        }
        const start = new Date(dto.startDate);
        const end = new Date(dto.endDate);
        if (end <= start) {
            throw new common_1.BadRequestException('endDate must be after startDate');
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
    async returnRental(userId, rentalId) {
        const rental = await this.prisma.rental.findUnique({ where: { id: rentalId } });
        if (!rental) {
            throw new common_1.NotFoundException('Rental not found');
        }
        if (rental.userId !== userId) {
            throw new common_1.BadRequestException('Cannot return rental not owned by user');
        }
        if (rental.endDate && rental.endDate <= new Date()) {
        }
        const car = await this.prisma.car.findUnique({ where: { id: rental.carId } });
        if (!car) {
            throw new common_1.NotFoundException('Car not found');
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
    getMy(userId) {
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
};
exports.RentalsService = RentalsService;
exports.RentalsService = RentalsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], RentalsService);
//# sourceMappingURL=rentals.service.js.map