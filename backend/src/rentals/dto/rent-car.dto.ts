import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsNotEmpty, IsString } from 'class-validator';

export class RentCarDto {
  @ApiProperty({ example: 'user-uuid' })
  @IsString()
  @IsNotEmpty()
  carId!: string;

  @ApiProperty({ example: '2026-04-01T10:00:00.000Z' })
  @IsDateString()
  startDate!: string;

  @ApiProperty({ example: '2026-04-05T10:00:00.000Z' })
  @IsDateString()
  endDate!: string;
}
