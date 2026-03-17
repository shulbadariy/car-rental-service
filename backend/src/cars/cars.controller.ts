import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CarsService } from './cars.service';
import { CreateCarDto } from './dto/create-car.dto';
import { UpdateCarLocationDto } from './dto/update-car-location.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { Role } from '@prisma/client';

@ApiTags('cars')
@Controller('cars')
export class CarsController {
  constructor(private readonly carsService: CarsService) {}

  @Post()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPERADMIN)
  create(@Body() dto: CreateCarDto) {
    return this.carsService.create(dto);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPERADMIN)
  remove(@Param('id') id: string) {
    return this.carsService.remove(id);
  }

  @Get()
  findAll(
    @Query('q') q?: string,
    @Query('brand') brand?: string,
    @Query('model') model?: string,
    @Query('year') year?: string,
    @Query('minStartPrice') minStartPrice?: string,
    @Query('maxStartPrice') maxStartPrice?: string,
    @Query('minPricePerMinute') minPricePerMinute?: string,
    @Query('maxPricePerMinute') maxPricePerMinute?: string,
  ) {
    if (q) {
      return this.carsService.findAll(q);
    }

    if (
      brand ||
      model ||
      year ||
      minStartPrice ||
      maxStartPrice ||
      minPricePerMinute ||
      maxPricePerMinute
    ) {
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

  @Get('search')
  search(@Query('q') q: string) {
    return this.carsService.search(q);
  }

  @Get('filters')
  getFilterOptions() {
    return this.carsService.getFilterOptions();
  }

  @Get('all')
  getAllCars() {
    return this.carsService.findAllIncludingRented();
  }

  @Get('filter')
  filter(
    @Query('brand') brand?: string,
    @Query('model') model?: string,
    @Query('year') year?: string,
    @Query('minStartPrice') minStartPrice?: string,
    @Query('maxStartPrice') maxStartPrice?: string,
    @Query('minPricePerMinute') minPricePerMinute?: string,
    @Query('maxPricePerMinute') maxPricePerMinute?: string,
  ) {
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

  @Patch(':id/location')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPERADMIN)
  updateLocation(@Param('id') id: string, @Body() dto: UpdateCarLocationDto) {
    return this.carsService.updateLocation(id, dto);
  }

  @Get('near')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  near(@Query('lat') lat: string, @Query('lng') lng: string, @Query('radius') radius: string) {
    return this.carsService.findNear(parseFloat(lat), parseFloat(lng), parseInt(radius, 10));
  }

  @Get(':id')
  getCarById(@Param('id') id: string) {
    return this.carsService.getCarById(id);
  }
}
