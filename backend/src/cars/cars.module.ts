import { Module } from '@nestjs/common';
import { CarsService } from './cars.service';
import { CarsController } from './cars.controller';
import { AdminCarsController } from './admin-cars.controller';

@Module({
  providers: [CarsService],
  controllers: [CarsController, AdminCarsController],
  exports: [CarsService],
})
export class CarsModule {}
