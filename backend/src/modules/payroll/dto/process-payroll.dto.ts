import {
  IsString,
  IsDateString,
  IsNumber,
  IsOptional,
  Min,
  Matches,
  IsArray,
  IsUUID,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

/**
 * DTO para procesar nomina masiva para un periodo
 * Genera registros de nomina para todos los empleados activos
 */
export class ProcessPayrollDto {
  @ApiProperty({
    description: 'Periodo de nomina en formato YYYY-MM',
    example: '2024-01',
  })
  @IsString()
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

  @ApiPropertyOptional({
    description: 'Porcentaje de bonificacion general a aplicar a todos los empleados',
    example: 5,
    default: 0,
    minimum: 0,
  })
  @IsNumber({}, { message: 'El porcentaje de bonificacion debe ser un numero' })
  @Min(0, { message: 'El porcentaje de bonificacion no puede ser negativo' })
  @IsOptional()
  @Transform(({ value }) => (value !== undefined ? parseFloat(value) : 0))
  bonificacionPorcentaje?: number;

  @ApiPropertyOptional({
    description: 'Lista de IDs de empleados especificos a procesar. Si no se proporciona, procesa todos los activos.',
    example: ['550e8400-e29b-41d4-a716-446655440000'],
  })
  @IsArray()
  @IsUUID('4', { each: true, message: 'Cada ID de empleado debe ser un UUID valido' })
  @IsOptional()
  empleadosIds?: string[];
}

/**
 * DTO para calcular deducciones legales
 * Usado internamente para calculo de salario neto
 */
export class DeduccionesLegalesDto {
  @ApiProperty({
    description: 'Porcentaje de aporte a salud (default 4%)',
    example: 4,
    default: 4,
  })
  @IsNumber()
  @Min(0)
  @IsOptional()
  @Transform(({ value }) => (value !== undefined ? parseFloat(value) : 4))
  porcentajeSalud?: number;

  @ApiProperty({
    description: 'Porcentaje de aporte a pension (default 4%)',
    example: 4,
    default: 4,
  })
  @IsNumber()
  @Min(0)
  @IsOptional()
  @Transform(({ value }) => (value !== undefined ? parseFloat(value) : 4))
  porcentajePension?: number;
}
