import {
  IsString,
  IsOptional,
  IsNumber,
  IsEnum,
  IsDateString,
  IsPositive,
  MinLength,
  MaxLength,
  Min,
  IsInt,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { InventoryStatus } from '@prisma/client';
import { Transform } from 'class-transformer';

/**
 * DTO para la creacion de un nuevo item de inventario
 * Incluye validaciones robustas para todos los campos
 */
export class CreateInventoryItemDto {
  @ApiPropertyOptional({
    description: 'Codigo unico del item. Si no se proporciona, se genera automaticamente (INV-YYYY-XXX)',
    example: 'INV-2024-001',
  })
  @IsString()
  @IsOptional()
  @MinLength(3, { message: 'El codigo debe tener al menos 3 caracteres' })
  @MaxLength(50, { message: 'El codigo no puede exceder 50 caracteres' })
  codigo?: string;

  @ApiProperty({
    description: 'Nombre descriptivo del producto/articulo',
    example: 'Resma de papel carta',
  })
  @IsString()
  @MinLength(3, { message: 'El nombre debe tener al menos 3 caracteres' })
  @MaxLength(200, { message: 'El nombre no puede exceder 200 caracteres' })
  nombre: string;

  @ApiProperty({
    description: 'Categoria del item',
    example: 'Papeleria',
  })
  @IsString()
  @MinLength(2, { message: 'La categoria debe tener al menos 2 caracteres' })
  @MaxLength(100, { message: 'La categoria no puede exceder 100 caracteres' })
  categoria: string;

  @ApiProperty({
    description: 'Cantidad actual en inventario',
    example: 100,
    minimum: 0,
  })
  @IsInt({ message: 'La cantidad debe ser un numero entero' })
  @Min(0, { message: 'La cantidad no puede ser negativa' })
  @Transform(({ value }) => parseInt(value, 10))
  cantidad: number;

  @ApiProperty({
    description: 'Cantidad minima antes de considerarse stock bajo',
    example: 20,
    minimum: 0,
  })
  @IsInt({ message: 'La cantidad minima debe ser un numero entero' })
  @Min(0, { message: 'La cantidad minima no puede ser negativa' })
  @Transform(({ value }) => parseInt(value, 10))
  cantidadMinima: number;

  @ApiProperty({
    description: 'Unidad de medida del producto',
    example: 'Unidad',
  })
  @IsString()
  @MinLength(1, { message: 'La unidad de medida es requerida' })
  @MaxLength(50, { message: 'La unidad de medida no puede exceder 50 caracteres' })
  unidadMedida: string;

  @ApiProperty({
    description: 'Precio unitario del producto',
    example: 15000,
    minimum: 0,
  })
  @IsNumber({}, { message: 'El precio unitario debe ser un numero' })
  @IsPositive({ message: 'El precio unitario debe ser positivo' })
  @Transform(({ value }) => parseFloat(value))
  precioUnitario: number;

  @ApiProperty({
    description: 'Ubicacion fisica del producto en bodega',
    example: 'Bodega A - Estante 3',
  })
  @IsString()
  @MinLength(3, { message: 'La ubicacion debe tener al menos 3 caracteres' })
  @MaxLength(200, { message: 'La ubicacion no puede exceder 200 caracteres' })
  ubicacion: string;

  @ApiProperty({
    description: 'Nombre del proveedor',
    example: 'Distribuidora Papeles S.A.',
  })
  @IsString()
  @MinLength(3, { message: 'El proveedor debe tener al menos 3 caracteres' })
  @MaxLength(200, { message: 'El proveedor no puede exceder 200 caracteres' })
  proveedor: string;

  @ApiProperty({
    description: 'Fecha de la ultima compra en formato ISO',
    example: '2024-01-15',
  })
  @IsDateString({}, { message: 'La fecha de ultima compra debe ser una fecha valida en formato ISO' })
  fechaUltimaCompra: string;

  @ApiPropertyOptional({
    description: 'Estado inicial del item (se calcula automaticamente si no se proporciona)',
    enum: InventoryStatus,
    example: InventoryStatus.DISPONIBLE,
  })
  @IsEnum(InventoryStatus, {
    message: `El estado debe ser uno de: ${Object.values(InventoryStatus).join(', ')}`,
  })
  @IsOptional()
  estado?: InventoryStatus;
}
