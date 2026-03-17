import { Module } from '@nestjs/common';
import { RentalsService } from './rentals.service';
import { RentalsController } from './rentals.controller';
import { AdminRentalsController } from './admin-rentals.controller';

@Module({
  providers: [RentalsService],
  controllers: [RentalsController, AdminRentalsController],
})
export class RentalsModule {}
