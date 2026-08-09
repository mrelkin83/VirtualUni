import { IsString, IsNotEmpty, IsEmail, MinLength, IsEnum, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Plan } from '@prisma/client';

export class CreateTenantDto {
  @ApiProperty({ example: 'Universidad del Norte' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'uninorte' })
  @IsString()
  @IsNotEmpty()
  slug: string;

  @ApiProperty({ example: 'admin@uninorte.edu' })
  @IsEmail()
  @IsNotEmpty()
  adminEmail: string;

  @ApiProperty({ example: 'Admin123!' })
  @IsString()
  @MinLength(6)
  adminPassword: string;

  @ApiProperty({ example: 'Juan' })
  @IsString()
  @IsNotEmpty()
  adminFirstName: string;

  @ApiProperty({ example: 'Pérez' })
  @IsString()
  @IsNotEmpty()
  adminLastName: string;

  @ApiProperty({ enum: Plan, example: Plan.FREE, required: false })
  @IsEnum(Plan)
  @IsOptional()
  plan?: Plan;
}
