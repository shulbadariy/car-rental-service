import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { Roles } from '../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { RentalsService } from './rentals.service';

@ApiTags('admin/rentals')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('admin/rentals')
export class AdminRentalsController {
  constructor(private readonly rentalsService: RentalsService) {}

  @Get('active')
  @Roles(Role.ADMIN)
  getActiveRentals() {
    return this.rentalsService.getActiveRentals();
  }
}
