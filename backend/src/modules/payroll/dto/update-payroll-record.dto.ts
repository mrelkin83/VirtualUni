import {
  IsNumber,
  IsEnum,
  IsDateString,
  Min,
  IsOptional,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PayrollStatus } from '@prisma/client';
import { Transform } from 'class-transformer';

/**
 * DTO para la actualizacion de un registro de nomina existente
 * No permite cambiar empleadoId ni periodo (campos inmutables)
 */
export class UpdatePayrollRecordDto {
  @ApiPropertyOptional({
    description: 'Fecha de inicio del periodo en formato ISO',
    example: '2024-01-01',
  })
  @IsDateString({}, { message: 'La fecha de inicio debe ser una fecha valida en formato ISO' })
  @IsOptional()
  fechaInicio?: string;

  @ApiPropertyOptional({
    description: 'Fecha de fin del periodo en formato ISO',
    example: '2024-01-31',
  })
  @IsDateString({}, { message: 'La fecha de fin debe ser una fecha valida en formato ISO' })
  @IsOptional()
  fechaFin?: string;

  @ApiPropertyOptional({
    description: 'Fecha programada de pago en formato ISO',
    example: '2024-02-05',
  })
  @IsDateString({}, { message: 'La fecha de pago debe ser una fecha valida en formato ISO' })
  @IsOptional()
  fechaPago?: string;

  @ApiPropertyOptional({
    description: 'Salario base del empleado para este periodo',
    example: 3500000,
    minimum: 0,
  })
  @IsNumber({}, { message: 'El salario base debe ser un numero' })
  @Min(0, { message: 'El salario base no puede ser negativo' })
  @IsOptional()
  @Transform(({ value }) => (value !== undefined ? parseFloat(value) : undefined))
  salarioBase?: number;

  @ApiPropertyOptional({
    description: 'Total de bonificaciones (horas extra, comisiones, etc.)',
    example: 500000,
    minimum: 0,
  })
  @IsNumber({}, { message: 'Las bonificaciones deben ser un numero' })
  @Min(0, { message: 'Las bonificaciones no pueden ser negativas' })
  @IsOptional()
  @Transform(({ value }) => (value !== undefined ? parseFloat(value) : undefined))
  bonificaciones?: number;

  @ApiPropertyOptional({
    description: 'Total de deducciones (salud, pension, prestamos, etc.)',
    example: 350000,
    minimum: 0,
  })
  @IsNumber({}, { message: 'Las deducciones deben ser un numero' })
  @Min(0, { message: 'Las deducciones no pueden ser negativas' })
  @IsOptional()
  @Transform(({ value }) => (value !== undefined ? parseFloat(value) : undefined))
  deducciones?: number;

  @ApiPropertyOptional({
    description: 'Estado del registro de nomina',
    enum: PayrollStatus,
    example: PayrollStatus.PROCESADO,
  })
  @IsEnum(PayrollStatus, {
    message: `El estado debe ser uno de: ${Object.values(PayrollStatus).join(', ')}`,
  })
  @IsOptional()
  estado?: PayrollStatus;
}
