import {
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsUUID,
  Min,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ProgramEnrollmentStatus } from '@prisma/client';

export class CrearInscripcionDto {
  @ApiProperty()
  @IsUUID()
  studentId: string;

  @ApiProperty()
  @IsUUID()
  programId: string;

  @ApiProperty({
    required: false,
    description: 'Versión del pensum; por defecto la VIGENTE del programa',
  })
  @IsUUID()
  @IsOptional()
  studyPlanId?: string;

  @ApiProperty({ example: 1, required: false })
  @IsInt()
  @Min(1)
  @IsOptional()
  currentLevel?: number;

  @ApiProperty({ required: false })
  @IsDateString()
  @IsOptional()
  startDate?: string;
}

export class ActualizarInscripcionDto {
  @ApiProperty({ required: false })
  @IsUUID()
  @IsOptional()
  studyPlanId?: string;

  @ApiProperty({ example: 2, required: false })
  @IsInt()
  @Min(1)
  @IsOptional()
  currentLevel?: number;

  @ApiProperty({ enum: ProgramEnrollmentStatus, required: false })
  @IsEnum(ProgramEnrollmentStatus, {
    message: `El estado debe ser uno de: ${Object.values(ProgramEnrollmentStatus).join(', ')}`,
  })
  @IsOptional()
  status?: ProgramEnrollmentStatus;

  @ApiProperty({ required: false })
  @IsDateString()
  @IsOptional()
  endDate?: string;
}
