import { IsEnum, IsNotEmpty, IsString, IsUrl, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Plan } from '@prisma/client';

export class CreateCheckoutSessionDto {
  @ApiProperty({ enum: Plan, example: Plan.BASIC })
  @IsEnum(Plan)
  @IsNotEmpty()
  plan: Plan;

  @ApiProperty({ example: 'http://localhost:5173/success' })
  @IsUrl()
  @IsNotEmpty()
  successUrl: string;

  @ApiProperty({ example: 'http://localhost:5173/cancel' })
  @IsUrl()
  @IsNotEmpty()
  cancelUrl: string;

  @ApiProperty({ example: 'tenant-uuid-here', required: false })
  @IsString()
  @IsOptional()
  tenantId?: string;
}
