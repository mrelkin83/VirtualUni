import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { ApiProperty, PartialType } from '@nestjs/swagger';
import { PeriodStatus } from '@prisma/client';

/**
 * Periodo académico del tenant: semestre ("2027-1"), año lectivo ("2027") o
 * cohorte ("COHORTE-03"). Los grupos (Course) se dictan dentro de un periodo.
 */
export class CrearPeriodoDto {
  @ApiProperty({ example: '2027-1' })
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiProperty({ example: 'Primer semestre 2027' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: '2027-01-15' })
  @IsDateString()
  startDate: string;

  @ApiProperty({ example: '2027-06-15' })
  @IsDateString()
  endDate: string;

  @ApiProperty({ enum: PeriodStatus, required: false })
  @IsEnum(PeriodStatus, {
    message: `El estado debe ser uno de: ${Object.values(PeriodStatus).join(', ')}`,
  })
  @IsOptional()
  status?: PeriodStatus;
}

export class ActualizarPeriodoDto extends PartialType(CrearPeriodoDto) {}
