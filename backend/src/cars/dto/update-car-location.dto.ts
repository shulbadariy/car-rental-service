import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';

export class UpdateCarLocationDto {
  @ApiProperty({ example: 34.05 })
  @IsNumber()
  lat!: number;

  @ApiProperty({ example: -118.24 })
  @IsNumber()
  lng!: number;
}
