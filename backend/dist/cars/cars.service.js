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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
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
    async updateCar(id, dto) {
        const car = await this.prisma.car.findUnique({ where: { id } });
        if (!car)
            throw new common_1.NotFoundException('Car not found');
        const { latitude, longitude } = dto, rest = __rest(dto, ["latitude", "longitude"]);
        return this.prisma.car.update({
            where: { id },
            data: Object.assign(Object.assign({}, rest), { lat: latitude !== null && latitude !== void 0 ? latitude : rest.lat, lng: longitude !== null && longitude !== void 0 ? longitude : rest.lng, status: dto.status }),
        });
    }
    findAll(q) {
        if (q) {
            return this.search(q);
        }
        return this.prisma.car.findMany({
            where: { status: 'AVAILABLE' }
        });
    }
    findAllIncludingRented() {
        return this.prisma.car.findMany();
    }
    getAllCarsForAdmin() {
        return this.prisma.car.findMany({
            include: {
                rentals: {
                    where: {
                        status: 'ACTIVE',
                    },
                    include: {
                        user: true,
                    },
                },
            },
        });
    }
    findOne(id) {
        return this.prisma.car.findUnique({ where: { id } });
    }
    getCarById(id) {
        return this.prisma.car.findUnique({ where: { id } });
    }
    async search(q) {
        const query = q === null || q === void 0 ? void 0 : q.trim();
        if (!query)
            return [];
        const lower = query.toLowerCase();
        return this.prisma.car.findMany({
            where: {
                status: 'AVAILABLE',
                OR: [
                    { brand: { contains: lower, mode: 'insensitive' } },
                    { model: { contains: lower, mode: 'insensitive' } },
                ],
            },
        });
    }
    async filter(params) {
        const where = {
            status: 'AVAILABLE',
        };
        if (params.brand)
            where.brand = { contains: params.brand, mode: 'insensitive' };
        if (params.model)
            where.model = { contains: params.model, mode: 'insensitive' };
        if (params.year)
            where.year = params.year;
        if (params.minStartPrice || params.maxStartPrice) {
            where.startPrice = {};
            if (params.minStartPrice)
                where.startPrice.gte = params.minStartPrice;
            if (params.maxStartPrice)
                where.startPrice.lte = params.maxStartPrice;
        }
        if (params.minPricePerMinute || params.maxPricePerMinute) {
            where.pricePerMinute = {};
            if (params.minPricePerMinute)
                where.pricePerMinute.gte = params.minPricePerMinute;
            if (params.maxPricePerMinute)
                where.pricePerMinute.lte = params.maxPricePerMinute;
        }
        return this.prisma.car.findMany({ where });
    }
    async getFilterOptions() {
        const cars = await this.prisma.car.findMany();
        console.log('CARS:', cars);
        const brands = [...new Set(cars.map((c) => c.brand))];
        const models = [...new Set(cars.map((c) => c.model))];
        const years = [...new Set(cars.map((c) => c.year))];
        return {
            brands,
            models,
            years,
        };
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