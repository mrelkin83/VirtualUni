import {
  IsString,
  IsOptional,
  IsEnum,
  IsBoolean,
  IsInt,
  Min,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Plan, TenantStatus } from '@prisma/client';

export class UpdateTenantDto {
  @ApiProperty({ example: 'Universidad del Norte', required: false })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({ example: 'https://cdn.example.com/logo.png', required: false })
  @IsString()
  @IsOptional()
  logo?: string;

  @ApiProperty({ example: '#3B82F6', required: false })
  @IsString()
  @IsOptional()
  primaryColor?: string;

  @ApiProperty({ example: '#8B5CF6', required: false })
  @IsString()
  @IsOptional()
  secondaryColor?: string;

  @ApiProperty({ enum: Plan, required: false })
  @IsEnum(Plan)
  @IsOptional()
  plan?: Plan;

  @ApiProperty({ enum: TenantStatus, required: false })
  @IsEnum(TenantStatus)
  @IsOptional()
  status?: TenantStatus;

  @ApiProperty({ required: false })
  @IsBoolean()
  @IsOptional()
  enableMessaging?: boolean;

  @ApiProperty({ required: false })
  @IsBoolean()
  @IsOptional()
  enableVideoConf?: boolean;

  @ApiProperty({ required: false })
  @IsBoolean()
  @IsOptional()
  enablePayments?: boolean;

  @ApiProperty({ required: false })
  @IsBoolean()
  @IsOptional()
  enableCertificates?: boolean;

  @ApiProperty({ required: false })
  @IsInt()
  @Min(0)
  @IsOptional()
  maxStudents?: number;

  @ApiProperty({ required: false })
  @IsInt()
  @Min(0)
  @IsOptional()
  maxTeachers?: number;

  @ApiProperty({ required: false })
  @IsInt()
  @Min(0)
  @IsOptional()
  maxCourses?: number;

  @ApiProperty({ required: false })
  @IsInt()
  @Min(0)
  @IsOptional()
  storageGB?: number;

  @ApiProperty({ example: 'custom.example.com', required: false })
  @IsString()
  @IsOptional()
  customDomain?: string;
}
