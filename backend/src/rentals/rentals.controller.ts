import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { RentalsService } from './rentals.service';
import { RentCarDto } from './dto/rent-car.dto';
import { ReturnCarDto } from './dto/return-car.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { CurrentUser } from '../common/decorators/user.decorator';

@ApiTags('rentals')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('rentals')
export class RentalsController {
  constructor(private readonly rentalsService: RentalsService) {}

  @Post()
  rent(@CurrentUser() user: any, @Body() dto: RentCarDto) {
    return this.rentalsService.startRental(user.userId, dto.carId);
  }

  @Post('start')
  startRental(@CurrentUser() user: any, @Body() dto: RentCarDto) {
    return this.rentalsService.startRental(user.userId, dto.carId);
  }

  @Post('stop')
  @Roles(Role.USER, Role.ADMIN, Role.SUPERADMIN)
  stopRental(@CurrentUser() user: any, @Body() dto: ReturnCarDto) {
    return this.rentalsService.stopRental(user.userId, dto.rentalId, user.role);
  }

  @Patch(':id/force-stop')
  @Roles(Role.ADMIN)
  forceStop(@Param('id') rentalId: string, @CurrentUser() user: any) {
    void user;
    return this.rentalsService.forceStopRental(rentalId);
  }

  @Get('my')
  my(@CurrentUser() user: any) {
    return this.rentalsService.getMy(user.userId);
  }

  @Get('active')
  @Roles(Role.ADMIN)
  active() {
    return this.rentalsService.getActiveRentals();
  }
}
