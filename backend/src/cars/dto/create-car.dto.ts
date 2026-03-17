import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsNumber, IsPositive, IsString } from 'class-validator';
import { CarStatus } from '@prisma/client';

export class CreateCarDto {
  @ApiProperty({ example: 'Subaru' })
  @IsString()
  @IsNotEmpty()
  brand!: string;

  @ApiProperty({ example: 'Outback' })
  @IsString()
  @IsNotEmpty()
  model!: string;

  @ApiProperty({ example: 2023 })
  @IsNumber()
  year!: number;

  @ApiProperty({ example: 10.0 })
  @IsNumber()
  @IsPositive()
  startPrice!: number;

  @ApiProperty({ example: 0.25 })
  @IsNumber()
  @IsPositive()
  pricePerMinute!: number;

  @ApiProperty({ example: 34.05 })
  @IsNumber()
  lat!: number;

  @ApiProperty({ example: -118.24 })
  @IsNumber()
  lng!: number;

  @ApiProperty({ enum: CarStatus, default: CarStatus.AVAILABLE })
  @IsEnum(CarStatus)
  status!: CarStatus;
}
