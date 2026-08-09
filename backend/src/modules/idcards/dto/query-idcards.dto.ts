import {
  IsString,
  IsOptional,
  IsEnum,
  IsInt,
  Min,
  Max,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { UserCardType, CardStatus } from '@prisma/client';
import { Transform, Type } from 'class-transformer';

/**
 * DTO para filtrar y paginar carnets de identificacion
 * Soporta busqueda por tipo, estado y termino de busqueda
 */
export class QueryIdCardsDto {
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
    description: 'Filtrar por tipo de usuario',
    enum: UserCardType,
    example: UserCardType.ESTUDIANTE,
  })
  @IsEnum(UserCardType, {
    message: `El tipo debe ser uno de: ${Object.values(UserCardType).join(', ')}`,
  })
  @IsOptional()
  tipoUsuario?: UserCardType;

  @ApiPropertyOptional({
    description: 'Filtrar por estado del carnet',
    enum: CardStatus,
    example: CardStatus.ACTIVO,
  })
  @IsEnum(CardStatus, {
    message: `El estado debe ser uno de: ${Object.values(CardStatus).join(', ')}`,
  })
  @IsOptional()
  estado?: CardStatus;

  @ApiPropertyOptional({
    description: 'Termino de busqueda general (busca en nombre, identificacion, numero de carnet)',
    example: 'Rodriguez',
  })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiPropertyOptional({
    description: 'Filtrar solo carnets vencidos',
    example: 'true',
  })
  @IsOptional()
  @Transform(({ value }) => value === 'true')
  vencidos?: boolean;

  @ApiPropertyOptional({
    description: 'Filtrar carnets que vencen pronto (proximos 30 dias)',
    example: 'true',
  })
  @IsOptional()
  @Transform(({ value }) => value === 'true')
  porVencer?: boolean;

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
