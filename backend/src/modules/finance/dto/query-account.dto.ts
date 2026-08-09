import {
  IsString,
  IsEnum,
  IsOptional,
  IsNumber,
  IsBoolean,
  Min,
  Max,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type, Transform } from 'class-transformer';
import { AccountType, AccountCategory } from '@prisma/client';

export class QueryAccountDto {
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
    description: 'Filtrar por tipo de cuenta',
    enum: AccountType,
  })
  @IsEnum(AccountType, {
    message: 'El tipo debe ser ACTIVO, PASIVO, PATRIMONIO, INGRESO o EGRESO',
  })
  @IsOptional()
  tipo?: AccountType;

  @ApiPropertyOptional({
    description: 'Filtrar por categoria',
    enum: AccountCategory,
  })
  @IsEnum(AccountCategory, {
    message: 'La categoria debe ser una de las categorias validas',
  })
  @IsOptional()
  categoria?: AccountCategory;

  @ApiPropertyOptional({
    description: 'Filtrar por estado activo/inactivo',
    example: true,
  })
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean({ message: 'El campo activa debe ser un booleano' })
  @IsOptional()
  activa?: boolean;

  @ApiPropertyOptional({
    description: 'Buscar por codigo o nombre',
    example: 'Bancolombia',
  })
  @IsString({ message: 'El termino de busqueda debe ser una cadena de texto' })
  @IsOptional()
  search?: string;

  @ApiPropertyOptional({
    description: 'Filtrar por moneda',
    example: 'COP',
  })
  @IsString({ message: 'La moneda debe ser una cadena de texto' })
  @IsOptional()
  moneda?: string;

  @ApiPropertyOptional({
    description: 'Campo por el cual ordenar',
    example: 'nombre',
    default: 'createdAt',
  })
  @IsString({ message: 'El campo de ordenamiento debe ser una cadena de texto' })
  @IsOptional()
  sortBy?: string = 'createdAt';

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
