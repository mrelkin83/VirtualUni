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
import { AssetCategory, AssetStatus } from '@prisma/client';
import { Transform, Type } from 'class-transformer';

/**
 * DTO para filtrar y paginar activos
 * Soporta busqueda por categoria, estado, ubicacion y termino de busqueda
 */
export class QueryAssetsDto {
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
    description: 'Filtrar por categoria del activo',
    enum: AssetCategory,
    example: AssetCategory.TECNOLOGIA,
  })
  @IsEnum(AssetCategory, {
    message: `La categoria debe ser una de: ${Object.values(AssetCategory).join(', ')}`,
  })
  @IsOptional()
  categoria?: AssetCategory;

  @ApiPropertyOptional({
    description: 'Filtrar por estado del activo',
    enum: AssetStatus,
    example: AssetStatus.BUENO,
  })
  @IsEnum(AssetStatus, {
    message: `El estado debe ser uno de: ${Object.values(AssetStatus).join(', ')}`,
  })
  @IsOptional()
  estado?: AssetStatus;

  @ApiPropertyOptional({
    description: 'Filtrar por ubicacion (busqueda parcial)',
    example: 'Edificio Principal',
  })
  @IsString()
  @IsOptional()
  ubicacion?: string;

  @ApiPropertyOptional({
    description: 'Termino de busqueda general (busca en codigo, nombre, descripcion, responsable)',
    example: 'laptop',
  })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiPropertyOptional({
    description: 'Filtrar por responsable (busqueda parcial)',
    example: 'Juan',
  })
  @IsString()
  @IsOptional()
  responsable?: string;

  @ApiPropertyOptional({
    description: 'Valor minimo de compra para filtrar',
    example: 1000000,
  })
  @IsNumber()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  valorMin?: number;

  @ApiPropertyOptional({
    description: 'Valor maximo de compra para filtrar',
    example: 5000000,
  })
  @IsNumber()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  valorMax?: number;

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
