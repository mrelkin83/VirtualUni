import { IsOptional, IsString, IsEnum, IsNumber, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IssuanceType, IssuanceStatus } from '@prisma/client';

/**
 * DTO para consultar expediciones con filtros y paginación
 */
export class QueryCardIssuancesDto {
  @ApiPropertyOptional({
    description: 'Número de página',
    example: 1,
    default: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Número de resultados por página',
    example: 20,
    default: 20,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  limit?: number = 20;

  @ApiPropertyOptional({
    description: 'Búsqueda por lote',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: 'Filtrar por tipo de expedición',
    enum: IssuanceType,
  })
  @IsOptional()
  @IsEnum(IssuanceType)
  tipoExpedicion?: IssuanceType;

  @ApiPropertyOptional({
    description: 'Filtrar por estado',
    enum: IssuanceStatus,
  })
  @IsOptional()
  @IsEnum(IssuanceStatus)
  estado?: IssuanceStatus;

  @ApiPropertyOptional({
    description: 'Filtrar por usuario que expidió',
  })
  @IsOptional()
  @IsString()
  expedidoPor?: string;

  @ApiPropertyOptional({
    description: 'Campo por el cual ordenar',
    example: 'fechaExpedicion',
    default: 'fechaExpedicion',
  })
  @IsOptional()
  @IsString()
  sortBy?: string = 'fechaExpedicion';

  @ApiPropertyOptional({
    description: 'Orden de los resultados',
    enum: ['asc', 'desc'],
    example: 'desc',
    default: 'desc',
  })
  @IsOptional()
  @IsEnum(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc' = 'desc';
}
