import {
  IsString,
  IsEnum,
  IsInt,
  MinLength,
  MaxLength,
  Min,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

/**
 * Tipos de ajuste de stock simplificados
 */
export enum AdjustmentType {
  AGREGAR = 'AGREGAR',
  REDUCIR = 'REDUCIR',
  ESTABLECER = 'ESTABLECER',
}

/**
 * DTO para ajustar el stock de un item de forma sencilla
 * Crea automaticamente un movimiento de tipo AJUSTE
 */
export class AdjustStockDto {
  @ApiProperty({
    description: 'Tipo de ajuste a realizar',
    enum: AdjustmentType,
    example: AdjustmentType.AGREGAR,
  })
  @IsEnum(AdjustmentType, {
    message: `El tipo de ajuste debe ser uno de: ${Object.values(AdjustmentType).join(', ')}`,
  })
  tipo: AdjustmentType;

  @ApiProperty({
    description: 'Cantidad para el ajuste (para ESTABLECER es el nuevo valor total)',
    example: 10,
    minimum: 0,
  })
  @IsInt({ message: 'La cantidad debe ser un numero entero' })
  @Min(0, { message: 'La cantidad no puede ser negativa' })
  @Transform(({ value }) => parseInt(value, 10))
  cantidad: number;

  @ApiProperty({
    description: 'Motivo del ajuste de stock',
    example: 'Ajuste por inventario fisico',
  })
  @IsString()
  @MinLength(5, { message: 'El motivo debe tener al menos 5 caracteres' })
  @MaxLength(500, { message: 'El motivo no puede exceder 500 caracteres' })
  motivo: string;

  @ApiProperty({
    description: 'Nombre del responsable del ajuste',
    example: 'Maria Garcia',
  })
  @IsString()
  @MinLength(3, { message: 'El nombre del responsable debe tener al menos 3 caracteres' })
  @MaxLength(150, { message: 'El nombre del responsable no puede exceder 150 caracteres' })
  responsable: string;
}
