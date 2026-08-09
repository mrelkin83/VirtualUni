import {
  IsString,
  IsEnum,
  IsOptional,
  IsNumber,
  IsNotEmpty,
  IsDateString,
  IsInt,
  Min,
  Max,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { BudgetStatus } from '@prisma/client';

export class CreateBudgetDto {
  @ApiProperty({ description: 'Nombre del presupuesto', example: 'Presupuesto de mantenimiento' })
  @IsString({ message: 'El nombre debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El nombre es requerido' })
  nombre: string;

  @ApiProperty({ description: 'Categoria del presupuesto', example: 'Infraestructura' })
  @IsString({ message: 'La categoria debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'La categoria es requerida' })
  categoria: string;

  @ApiProperty({ description: 'Monto asignado', example: 10000000 })
  @IsNumber({}, { message: 'El monto debe ser un numero' })
  @Min(0, { message: 'El monto no puede ser negativo' })
  monto: number;

  @ApiPropertyOptional({ description: 'Monto ya gastado', example: 0, default: 0 })
  @IsNumber({}, { message: 'El gastado debe ser un numero' })
  @Min(0, { message: 'El gastado no puede ser negativo' })
  @IsOptional()
  gastado?: number;

  @ApiProperty({ description: 'Periodo del presupuesto', example: '2026-Q1' })
  @IsString({ message: 'El periodo debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El periodo es requerido' })
  periodo: string;

  @ApiProperty({ description: 'Fecha de inicio (ISO)', example: '2026-01-01' })
  @IsDateString({}, { message: 'La fecha de inicio debe ser una fecha valida' })
  fechaInicio: string;

  @ApiProperty({ description: 'Fecha de fin (ISO)', example: '2026-03-31' })
  @IsDateString({}, { message: 'La fecha de fin debe ser una fecha valida' })
  fechaFin: string;

  @ApiProperty({ description: 'Estado del presupuesto', enum: BudgetStatus })
  @IsEnum(BudgetStatus, { message: 'El estado del presupuesto no es valido' })
  estado: BudgetStatus;

  @ApiPropertyOptional({ description: 'Descripcion del presupuesto' })
  @IsString({ message: 'La descripcion debe ser una cadena de texto' })
  @IsOptional()
  descripcion?: string;

  @ApiPropertyOptional({
    description: 'Porcentaje de ejecucion en el que se emite alerta',
    example: 80,
    default: 80,
  })
  @IsInt({ message: 'La alerta debe ser un numero entero' })
  @Min(1, { message: 'La alerta debe ser mayor a 0' })
  @Max(100, { message: 'La alerta no puede exceder 100' })
  @IsOptional()
  alertaEn?: number;
}
