import {
  IsString,
  IsEnum,
  IsOptional,
  IsNumber,
  IsDateString,
  Min,
  Max,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { TransactionType, TransactionStatus } from '@prisma/client';

export class QueryTransactionDto {
  @ApiPropertyOptional({
    description: 'Numero de pagina',
    default: 1,
    minimum: 1,
  })
  @Type(() => Number)
  @IsNumber({}, { message: 'La pagina debe ser un numero' })
  @Min(1, { message: 'La pagina debe ser mayor o igual a 1' })
  @IsOptional()
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Cantidad de registros por pagina',
    default: 20,
    minimum: 1,
    maximum: 100,
  })
  @Type(() => Number)
  @IsNumber({}, { message: 'El limite debe ser un numero' })
  @Min(1, { message: 'El limite debe ser mayor o igual a 1' })
  @Max(100, { message: 'El limite no puede exceder 100' })
  @IsOptional()
  limit?: number = 20;

  @ApiPropertyOptional({
    description: 'Filtrar por tipo de transaccion',
    enum: TransactionType,
  })
  @IsEnum(TransactionType, { message: 'El tipo debe ser INGRESO o EGRESO' })
  @IsOptional()
  tipo?: TransactionType;

  @ApiPropertyOptional({
    description: 'Filtrar por estado',
    enum: TransactionStatus,
  })
  @IsEnum(TransactionStatus, {
    message: 'El estado debe ser PENDIENTE, COMPLETADO, CANCELADO o RECHAZADO',
  })
  @IsOptional()
  estado?: TransactionStatus;

  @ApiPropertyOptional({
    description: 'Filtrar por categoria',
    example: 'Matriculas',
  })
  @IsString({ message: 'La categoria debe ser una cadena de texto' })
  @IsOptional()
  categoria?: string;

  @ApiPropertyOptional({
    description: 'Buscar por codigo, concepto, estudiante o referencia',
    example: 'TRN-2025',
  })
  @IsString({ message: 'El termino de busqueda debe ser una cadena de texto' })
  @IsOptional()
  search?: string;

  @ApiPropertyOptional({
    description: 'Fecha de inicio del rango',
    example: '2025-01-01',
  })
  @IsDateString({}, { message: 'La fecha de inicio debe ser una fecha valida' })
  @IsOptional()
  fechaInicio?: string;

  @ApiPropertyOptional({
    description: 'Fecha de fin del rango',
    example: '2025-12-31',
  })
  @IsDateString({}, { message: 'La fecha de fin debe ser una fecha valida' })
  @IsOptional()
  fechaFin?: string;

  @ApiPropertyOptional({
    description: 'Monto minimo',
    example: 100000,
  })
  @Type(() => Number)
  @IsNumber({}, { message: 'El monto minimo debe ser un numero' })
  @IsOptional()
  montoMin?: number;

  @ApiPropertyOptional({
    description: 'Monto maximo',
    example: 5000000,
  })
  @Type(() => Number)
  @IsNumber({}, { message: 'El monto maximo debe ser un numero' })
  @IsOptional()
  montoMax?: number;

  @ApiPropertyOptional({
    description: 'Campo por el cual ordenar',
    example: 'fecha',
    default: 'fecha',
  })
  @IsString({ message: 'El campo de ordenamiento debe ser una cadena de texto' })
  @IsOptional()
  sortBy?: string = 'fecha';

  @ApiPropertyOptional({
    description: 'Direccion del ordenamiento',
    example: 'desc',
    default: 'desc',
    enum: ['asc', 'desc'],
  })
  @IsString({ message: 'La direccion debe ser asc o desc' })
  @IsOptional()
  sortOrder?: 'asc' | 'desc' = 'desc';
}
