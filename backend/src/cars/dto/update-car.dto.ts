import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsOptional, IsPositive, IsString } from 'class-validator';
import { CarStatus } from '@prisma/client';

export class UpdateCarDto {
  @ApiPropertyOptional({ example: 'Subaru' })
  @IsOptional()
  @IsString()
  brand?: string;

  @ApiPropertyOptional({ example: 'Outback' })
  @IsOptional()
  @IsString()
  model?: string;

  @ApiPropertyOptional({ example: 2023 })
  @IsOptional()
  @IsNumber()
  year?: number;

  @ApiPropertyOptional({ example: 10.0 })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  startPrice?: number;

  @ApiPropertyOptional({ example: 0.25 })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  pricePerMinute?: number;

  @ApiPropertyOptional({ example: 34.05 })
  @IsOptional()
  @IsNumber()
  lat?: number;

  @ApiPropertyOptional({ example: 34.05 })
  @IsOptional()
  @IsNumber()
  latitude?: number;

  @ApiPropertyOptional({ example: -118.24 })
  @IsOptional()
  @IsNumber()
  lng?: number;

  @ApiPropertyOptional({ example: -118.24 })
  @IsOptional()
  @IsNumber()
  longitude?: number;

  @ApiPropertyOptional({ enum: CarStatus })
  @IsOptional()
  @IsEnum(CarStatus)
  status?: CarStatus;
}
