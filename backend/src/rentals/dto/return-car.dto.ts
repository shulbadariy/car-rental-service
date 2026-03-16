import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class ReturnCarDto {
  @ApiProperty({ example: 'rental-uuid' })
  @IsString()
  rentalId!: string;
}
