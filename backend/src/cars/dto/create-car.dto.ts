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

  @ApiProperty({ example: 33.5 })
  @IsNumber()
  @IsPositive()
  dailyRate!: number;

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
