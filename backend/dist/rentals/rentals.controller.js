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
exports.RentalsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const rentals_service_1 = require("./rentals.service");
const rent_car_dto_1 = require("./dto/rent-car.dto");
const return_car_dto_1 = require("./dto/return-car.dto");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../common/guards/roles.guard");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
const client_1 = require("@prisma/client");
const user_decorator_1 = require("../common/decorators/user.decorator");
let RentalsController = class RentalsController {
    constructor(rentalsService) {
        this.rentalsService = rentalsService;
    }
    rent(user, dto) {
        return this.rentalsService.startRental(user.userId, dto.carId);
    }
    startRental(user, dto) {
        return this.rentalsService.startRental(user.userId, dto.carId);
    }
    stopRental(user, dto) {
        return this.rentalsService.stopRental(user.userId, dto.rentalId);
    }
    my(user) {
        return this.rentalsService.getMy(user.userId);
    }
    active() {
        return this.rentalsService.getActive();
    }
};
exports.RentalsController = RentalsController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, rent_car_dto_1.RentCarDto]),
    __metadata("design:returntype", void 0)
], RentalsController.prototype, "rent", null);
__decorate([
    (0, common_1.Post)('start'),
    __param(0, (0, user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, rent_car_dto_1.RentCarDto]),
    __metadata("design:returntype", void 0)
], RentalsController.prototype, "startRental", null);
__decorate([
    (0, common_1.Post)('stop'),
    __param(0, (0, user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, return_car_dto_1.ReturnCarDto]),
    __metadata("design:returntype", void 0)
], RentalsController.prototype, "stopRental", null);
__decorate([
    (0, common_1.Get)('my'),
    __param(0, (0, user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], RentalsController.prototype, "my", null);
__decorate([
    (0, common_1.Get)('active'),
    (0, roles_decorator_1.Roles)(client_1.Role.ADMIN, client_1.Role.SUPERADMIN),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], RentalsController.prototype, "active", null);
exports.RentalsController = RentalsController = __decorate([
    (0, swagger_1.ApiTags)('rentals'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, common_1.Controller)('rentals'),
    __metadata("design:paramtypes", [rentals_service_1.RentalsService])
], RentalsController);
//# sourceMappingURL=rentals.controller.js.map