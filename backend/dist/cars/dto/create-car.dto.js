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
exports.CreateCarDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const client_1 = require("@prisma/client");
class CreateCarDto {
}
exports.CreateCarDto = CreateCarDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Subaru' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateCarDto.prototype, "brand", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Outback' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateCarDto.prototype, "model", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 2023 }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateCarDto.prototype, "year", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 10.0 }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsPositive)(),
    __metadata("design:type", Number)
], CreateCarDto.prototype, "startPrice", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 0.25 }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsPositive)(),
    __metadata("design:type", Number)
], CreateCarDto.prototype, "pricePerMinute", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 34.05 }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateCarDto.prototype, "lat", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: -118.24 }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateCarDto.prototype, "lng", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: client_1.CarStatus, default: client_1.CarStatus.AVAILABLE }),
    (0, class_validator_1.IsEnum)(client_1.CarStatus),
    __metadata("design:type", String)
], CreateCarDto.prototype, "status", void 0);
//# sourceMappingURL=create-car.dto.js.map