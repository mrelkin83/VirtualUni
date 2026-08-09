import {
  IsString,
  IsOptional,
  IsEnum,
  IsInt,
  Min,
  Max,
  IsNumber,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { InventoryStatus } from '@prisma/client';
import { Transform, Type } from 'class-transformer';

/**
 * DTO para filtrar y paginar items de inventario
 * Soporta busqueda por categoria, estado, proveedor y termino de busqueda
 */
export class QueryInventoryDto {
  @ApiPropertyOptional({
    description: 'Numero de pagina para paginacion',
    example: 1,
    minimum: 1,
    default: 1,
  })
  @IsInt()
  @Min(1)
  @IsOptional()
  @Type(() => Number)
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Cantidad de registros por pagina',
    example: 20,
    minimum: 1,
    maximum: 100,
    default: 20,
  })
  @IsInt()
  @Min(1)
  @Max(100)
  @IsOptional()
  @Type(() => Number)
  limit?: number = 20;

  @ApiPropertyOptional({
    description: 'Filtrar por categoria del item',
    example: 'Papeleria',
  })
  @IsString()
  @IsOptional()
  categoria?: string;

  @ApiPropertyOptional({
    description: 'Filtrar por estado del inventario',
    enum: InventoryStatus,
    example: InventoryStatus.DISPONIBLE,
  })
  @IsEnum(InventoryStatus, {
    message: `El estado debe ser uno de: ${Object.values(InventoryStatus).join(', ')}`,
  })
  @IsOptional()
  estado?: InventoryStatus;

  @ApiPropertyOptional({
    description: 'Filtrar por proveedor (busqueda parcial)',
    example: 'Distribuidora',
  })
  @IsString()
  @IsOptional()
  proveedor?: string;

  @ApiPropertyOptional({
    description: 'Filtrar por ubicacion (busqueda parcial)',
    example: 'Bodega A',
  })
  @IsString()
  @IsOptional()
  ubicacion?: string;

  @ApiPropertyOptional({
    description: 'Termino de busqueda general (busca en codigo, nombre, categoria, proveedor)',
    example: 'papel',
  })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiPropertyOptional({
    description: 'Precio minimo unitario para filtrar',
    example: 1000,
  })
  @IsNumber()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  precioMin?: number;

  @ApiPropertyOptional({
    description: 'Precio maximo unitario para filtrar',
    example: 50000,
  })
  @IsNumber()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  precioMax?: number;

  @ApiPropertyOptional({
    description: 'Campo por el cual ordenar',
    example: 'createdAt',
    default: 'createdAt',
  })
  @IsString()
  @IsOptional()
  sortBy?: string = 'createdAt';

  @ApiPropertyOptional({
    description: 'Direccion del ordenamiento',
    example: 'desc',
    enum: ['asc', 'desc'],
    default: 'desc',
  })
  @IsString()
  @IsOptional()
  @Transform(({ value }) => value?.toLowerCase())
  sortOrder?: 'asc' | 'desc' = 'desc';
}

/**
 * DTO para filtrar movimientos de inventario
 */
export class QueryInventoryMovementsDto {
  @ApiPropertyOptional({
    description: 'Numero de pagina para paginacion',
    example: 1,
    minimum: 1,
    default: 1,
  })
  @IsInt()
  @Min(1)
  @IsOptional()
  @Type(() => Number)
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Cantidad de registros por pagina',
    example: 20,
    minimum: 1,
    maximum: 100,
    default: 20,
  })
  @IsInt()
  @Min(1)
  @Max(100)
  @IsOptional()
  @Type(() => Number)
  limit?: number = 20;

  @ApiPropertyOptional({
    description: 'Filtrar por ID del item',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsString()
  @IsOptional()
  itemId?: string;

  @ApiPropertyOptional({
    description: 'Filtrar por tipo de movimiento',
    enum: ['ENTRADA', 'SALIDA', 'AJUSTE'],
    example: 'ENTRADA',
  })
  @IsString()
  @IsOptional()
  tipo?: string;

  @ApiPropertyOptional({
    description: 'Filtrar por responsable (busqueda parcial)',
    example: 'Juan',
  })
  @IsString()
  @IsOptional()
  responsable?: string;

  @ApiPropertyOptional({
    description: 'Fecha inicio del rango de busqueda',
    example: '2024-01-01',
  })
  @IsString()
  @IsOptional()
  fechaInicio?: string;

  @ApiPropertyOptional({
    description: 'Fecha fin del rango de busqueda',
    example: '2024-12-31',
  })
  @IsString()
  @IsOptional()
  fechaFin?: string;

  @ApiPropertyOptional({
    description: 'Campo por el cual ordenar',
    example: 'fecha',
    default: 'fecha',
  })
  @IsString()
  @IsOptional()
  sortBy?: string = 'fecha';

  @ApiPropertyOptional({
    description: 'Direccion del ordenamiento',
    example: 'desc',
    enum: ['asc', 'desc'],
    default: 'desc',
  })
  @IsString()
  @IsOptional()
  @Transform(({ value }) => value?.toLowerCase())
  sortOrder?: 'asc' | 'desc' = 'desc';
}
