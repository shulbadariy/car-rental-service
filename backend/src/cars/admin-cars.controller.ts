import { Body, Controller, Get, Patch, Param, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CarsService } from './cars.service';
import { UpdateCarDto } from './dto/update-car.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '@prisma/client';

@ApiTags('admin/cars')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('admin/cars')
export class AdminCarsController {
  constructor(private readonly carsService: CarsService) {}

  @Get()
  @Roles(Role.ADMIN, Role.SUPERADMIN)
  findAllForAdmin() {
    return this.carsService.getAllCarsForAdmin();
  }

  @Patch(':id')
  @Roles(Role.ADMIN, Role.SUPERADMIN)
  update(@Param('id') id: string, @Body() dto: UpdateCarDto) {
    return this.carsService.updateCar(id, dto);
  }
}
