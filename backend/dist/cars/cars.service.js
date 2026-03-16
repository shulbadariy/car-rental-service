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
exports.CarsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let CarsService = class CarsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    create(data) {
        return this.prisma.car.create({ data });
    }
    async remove(id) {
        const car = await this.prisma.car.findUnique({ where: { id } });
        if (!car)
            throw new common_1.NotFoundException('Car not found');
        return this.prisma.car.delete({ where: { id } });
    }
    findAll(q) {
        if (q) {
            return this.search(q);
        }
        return this.prisma.car.findMany();
    }
    findOne(id) {
        return this.prisma.car.findUnique({ where: { id } });
    }
    async search(q) {
        const query = q === null || q === void 0 ? void 0 : q.trim();
        if (!query)
            return [];
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
    async filter(params) {
        const where = {};
        if (params.brand)
            where.brand = { equals: params.brand, mode: 'insensitive' };
        if (params.model)
            where.model = { equals: params.model, mode: 'insensitive' };
        if (params.year)
            where.year = params.year;
        if (params.status)
            where.status = params.status;
        if (params.dailyRateMin || params.dailyRateMax) {
            where.dailyRate = {};
            if (params.dailyRateMin)
                where.dailyRate.gte = params.dailyRateMin;
            if (params.dailyRateMax)
                where.dailyRate.lte = params.dailyRateMax;
        }
        return this.prisma.car.findMany({ where });
    }
    async updateLocation(id, dto) {
        const car = await this.prisma.car.findUnique({ where: { id } });
        if (!car)
            throw new common_1.NotFoundException('Car not found');
        return this.prisma.car.update({ where: { id }, data: { lat: dto.lat, lng: dto.lng } });
    }
    async findNear(lat, lng, radius) {
        if (![5, 10, 15].includes(radius)) {
            throw new common_1.BadRequestException('Radius must be one of 5, 10, 15 km');
        }
        const cars = await this.prisma.car.findMany();
        const toRad = (deg) => (deg * Math.PI) / 180;
        const earthRadiusKm = 6371;
        const within = cars.filter((car) => {
            const dLat = toRad(car.lat - lat);
            const dLng = toRad(car.lng - lng);
            const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(toRad(lat)) * Math.cos(toRad(car.lat)) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
            const distance = earthRadiusKm * c;
            return distance <= radius;
        });
        return within;
    }
};
exports.CarsService = CarsService;
exports.CarsService = CarsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CarsService);
//# sourceMappingURL=cars.service.js.map