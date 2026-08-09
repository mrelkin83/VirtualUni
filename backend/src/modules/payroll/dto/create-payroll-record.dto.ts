import {
  IsString,
  IsNumber,
  IsEnum,
  IsDateString,
  IsUUID,
  Min,
  IsOptional,
  MaxLength,
  Matches,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PayrollStatus } from '@prisma/client';
import { Transform } from 'class-transformer';

/**
 * DTO para la creacion de un nuevo registro de nomina
 * Incluye validaciones para el calculo de salario neto
 */
export class CreatePayrollRecordDto {
  @ApiProperty({
    description: 'ID del empleado al que pertenece este registro',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID('4', { message: 'El ID del empleado debe ser un UUID valido' })
  empleadoId: string;

  @ApiProperty({
    description: 'Periodo de nomina en formato YYYY-MM',
    example: '2024-01',
  })
  @IsString()
  @MaxLength(7, { message: 'El periodo no puede exceder 7 caracteres' })
  @Matches(/^\d{4}-(0[1-9]|1[0-2])$/, {
    message: 'El periodo debe tener formato YYYY-MM (ej: 2024-01)',
  })
  periodo: string;

  @ApiProperty({
    description: 'Fecha de inicio del periodo en formato ISO',
    example: '2024-01-01',
  })
  @IsDateString({}, { message: 'La fecha de inicio debe ser una fecha valida en formato ISO' })
  fechaInicio: string;

  @ApiProperty({
    description: 'Fecha de fin del periodo en formato ISO',
    example: '2024-01-31',
  })
  @IsDateString({}, { message: 'La fecha de fin debe ser una fecha valida en formato ISO' })
  fechaFin: string;

  @ApiProperty({
    description: 'Fecha programada de pago en formato ISO',
    example: '2024-02-05',
  })
  @IsDateString({}, { message: 'La fecha de pago debe ser una fecha valida en formato ISO' })
  fechaPago: string;

  @ApiProperty({
    description: 'Salario base del empleado para este periodo',
    example: 3500000,
    minimum: 0,
  })
  @IsNumber({}, { message: 'El salario base debe ser un numero' })
  @Min(0, { message: 'El salario base no puede ser negativo' })
  @Transform(({ value }) => parseFloat(value))
  salarioBase: number;

  @ApiPropertyOptional({
    description: 'Total de bonificaciones (horas extra, comisiones, etc.)',
    example: 500000,
    default: 0,
    minimum: 0,
  })
  @IsNumber({}, { message: 'Las bonificaciones deben ser un numero' })
  @Min(0, { message: 'Las bonificaciones no pueden ser negativas' })
  @IsOptional()
  @Transform(({ value }) => (value !== undefined ? parseFloat(value) : 0))
  bonificaciones?: number;

  @ApiPropertyOptional({
    description: 'Total de deducciones (salud, pension, prestamos, etc.)',
    example: 350000,
    default: 0,
    minimum: 0,
  })
  @IsNumber({}, { message: 'Las deducciones deben ser un numero' })
  @Min(0, { message: 'Las deducciones no pueden ser negativas' })
  @IsOptional()
  @Transform(({ value }) => (value !== undefined ? parseFloat(value) : 0))
  deducciones?: number;

  @ApiPropertyOptional({
    description: 'Estado del registro de nomina',
    enum: PayrollStatus,
    example: PayrollStatus.BORRADOR,
    default: PayrollStatus.BORRADOR,
  })
  @IsEnum(PayrollStatus, {
    message: `El estado debe ser uno de: ${Object.values(PayrollStatus).join(', ')}`,
  })
  @IsOptional()
  estado?: PayrollStatus;
}
