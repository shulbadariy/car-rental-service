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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CarsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const cars_service_1 = require("./cars.service");
const create_car_dto_1 = require("./dto/create-car.dto");
const update_car_location_dto_1 = require("./dto/update-car-location.dto");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
const roles_guard_1 = require("../common/guards/roles.guard");
const client_1 = require("@prisma/client");
let CarsController = class CarsController {
    constructor(carsService) {
        this.carsService = carsService;
    }
    create(dto) {
        return this.carsService.create(dto);
    }
    remove(id) {
        return this.carsService.remove(id);
    }
    findAll(q, brand, model, year, minStartPrice, maxStartPrice, minPricePerMinute, maxPricePerMinute) {
        if (q) {
            return this.carsService.findAll(q);
        }
        if (brand ||
            model ||
            year ||
            minStartPrice ||
            maxStartPrice ||
            minPricePerMinute ||
            maxPricePerMinute) {
            return this.carsService.filter({
                brand,
                model,
                year: year ? parseInt(year, 10) : undefined,
                minStartPrice: minStartPrice ? parseFloat(minStartPrice) : undefined,
                maxStartPrice: maxStartPrice ? parseFloat(maxStartPrice) : undefined,
                minPricePerMinute: minPricePerMinute ? parseFloat(minPricePerMinute) : undefined,
                maxPricePerMinute: maxPricePerMinute ? parseFloat(maxPricePerMinute) : undefined,
            });
        }
        return this.carsService.findAll();
    }
    search(q) {
        return this.carsService.search(q);
    }
    getFilterOptions() {
        return this.carsService.getFilterOptions();
    }
    getAllCars() {
        return this.carsService.findAllIncludingRented();
    }
    filter(brand, model, year, minStartPrice, maxStartPrice, minPricePerMinute, maxPricePerMinute) {
        return this.carsService.filter({
            brand,
            model,
            year: year ? parseInt(year, 10) : undefined,
            minStartPrice: minStartPrice ? parseFloat(minStartPrice) : undefined,
            maxStartPrice: maxStartPrice ? parseFloat(maxStartPrice) : undefined,
            minPricePerMinute: minPricePerMinute ? parseFloat(minPricePerMinute) : undefined,
            maxPricePerMinute: maxPricePerMinute ? parseFloat(maxPricePerMinute) : undefined,
        });
    }
    updateLocation(id, dto) {
        return this.carsService.updateLocation(id, dto);
    }
    near(lat, lng, radius) {
        return this.carsService.findNear(parseFloat(lat), parseFloat(lng), parseInt(radius, 10));
    }
    getCarById(id) {
        return this.carsService.getCarById(id);
    }
};
exports.CarsController = CarsController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.Role.ADMIN, client_1.Role.SUPERADMIN),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_car_dto_1.CreateCarDto]),
    __metadata("design:returntype", void 0)
], CarsController.prototype, "create", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.Role.ADMIN, client_1.Role.SUPERADMIN),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], CarsController.prototype, "remove", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('q')),
    __param(1, (0, common_1.Query)('brand')),
    __param(2, (0, common_1.Query)('model')),
    __param(3, (0, common_1.Query)('year')),
    __param(4, (0, common_1.Query)('minStartPrice')),
    __param(5, (0, common_1.Query)('maxStartPrice')),
    __param(6, (0, common_1.Query)('minPricePerMinute')),
    __param(7, (0, common_1.Query)('maxPricePerMinute')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String, String, String, String]),
    __metadata("design:returntype", void 0)
], CarsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('search'),
    __param(0, (0, common_1.Query)('q')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], CarsController.prototype, "search", null);
__decorate([
    (0, common_1.Get)('filters'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], CarsController.prototype, "getFilterOptions", null);
__decorate([
    (0, common_1.Get)('all'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], CarsController.prototype, "getAllCars", null);
__decorate([
    (0, common_1.Get)('filter'),
    __param(0, (0, common_1.Query)('brand')),
    __param(1, (0, common_1.Query)('model')),
    __param(2, (0, common_1.Query)('year')),
    __param(3, (0, common_1.Query)('minStartPrice')),
    __param(4, (0, common_1.Query)('maxStartPrice')),
    __param(5, (0, common_1.Query)('minPricePerMinute')),
    __param(6, (0, common_1.Query)('maxPricePerMinute')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String, String, String]),
    __metadata("design:returntype", void 0)
], CarsController.prototype, "filter", null);
__decorate([
    (0, common_1.Patch)(':id/location'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.Role.ADMIN, client_1.Role.SUPERADMIN),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_car_location_dto_1.UpdateCarLocationDto]),
    __metadata("design:returntype", void 0)
], CarsController.prototype, "updateLocation", null);
__decorate([
    (0, common_1.Get)('near'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Query)('lat')),
    __param(1, (0, common_1.Query)('lng')),
    __param(2, (0, common_1.Query)('radius')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", void 0)
], CarsController.prototype, "near", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], CarsController.prototype, "getCarById", null);
exports.CarsController = CarsController = __decorate([
    (0, swagger_1.ApiTags)('cars'),
    (0, common_1.Controller)('cars'),
    __metadata("design:paramtypes", [cars_service_1.CarsService])
], CarsController);
//# sourceMappingURL=cars.controller.js.map