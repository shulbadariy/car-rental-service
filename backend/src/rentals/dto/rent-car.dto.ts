import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class RentCarDto {
  @ApiProperty({ example: 'car-uuid' })
  @IsString()
  @IsNotEmpty()
  carId!: string;
}
