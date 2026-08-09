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
  IsUrl,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AssetCategory, AssetStatus } from '@prisma/client';
import { Transform } from 'class-transformer';

/**
 * DTO para la creacion de un nuevo activo
 * Incluye validaciones robustas para todos los campos
 */
export class CreateAssetDto {
  @ApiPropertyOptional({
    description: 'Codigo unico del activo. Si no se proporciona, se genera automaticamente (ACT-YYYY-XXX)',
    example: 'ACT-2024-001',
  })
  @IsString()
  @IsOptional()
  @MinLength(3, { message: 'El codigo debe tener al menos 3 caracteres' })
  @MaxLength(50, { message: 'El codigo no puede exceder 50 caracteres' })
  codigo?: string;

  @ApiProperty({
    description: 'Nombre descriptivo del activo',
    example: 'Laptop Dell Latitude 5520',
  })
  @IsString()
  @MinLength(3, { message: 'El nombre debe tener al menos 3 caracteres' })
  @MaxLength(200, { message: 'El nombre no puede exceder 200 caracteres' })
  nombre: string;

  @ApiProperty({
    description: 'Categoria del activo',
    enum: AssetCategory,
    example: AssetCategory.TECNOLOGIA,
  })
  @IsEnum(AssetCategory, {
    message: `La categoria debe ser una de: ${Object.values(AssetCategory).join(', ')}`,
  })
  categoria: AssetCategory;

  @ApiProperty({
    description: 'Descripcion detallada del activo',
    example: 'Laptop empresarial con procesador Intel Core i7, 16GB RAM, 512GB SSD',
  })
  @IsString()
  @MinLength(10, { message: 'La descripcion debe tener al menos 10 caracteres' })
  @MaxLength(2000, { message: 'La descripcion no puede exceder 2000 caracteres' })
  descripcion: string;

  @ApiProperty({
    description: 'Valor de compra del activo en la moneda local',
    example: 2500000,
    minimum: 0,
  })
  @IsNumber({}, { message: 'El valor de compra debe ser un numero' })
  @IsPositive({ message: 'El valor de compra debe ser positivo' })
  @Transform(({ value }) => parseFloat(value))
  valorCompra: number;

  @ApiPropertyOptional({
    description: 'Valor actual del activo (si no se proporciona, se usa valorCompra)',
    example: 2000000,
    minimum: 0,
  })
  @IsNumber({}, { message: 'El valor actual debe ser un numero' })
  @Min(0, { message: 'El valor actual no puede ser negativo' })
  @IsOptional()
  @Transform(({ value }) => (value !== undefined ? parseFloat(value) : undefined))
  valorActual?: number;

  @ApiProperty({
    description: 'Fecha de compra del activo en formato ISO',
    example: '2024-01-15',
  })
  @IsDateString({}, { message: 'La fecha de compra debe ser una fecha valida en formato ISO' })
  fechaCompra: string;

  @ApiProperty({
    description: 'Estado actual del activo',
    enum: AssetStatus,
    example: AssetStatus.EXCELENTE,
  })
  @IsEnum(AssetStatus, {
    message: `El estado debe ser uno de: ${Object.values(AssetStatus).join(', ')}`,
  })
  estado: AssetStatus;

  @ApiProperty({
    description: 'Ubicacion fisica del activo',
    example: 'Edificio Principal - Oficina 302',
  })
  @IsString()
  @MinLength(3, { message: 'La ubicacion debe tener al menos 3 caracteres' })
  @MaxLength(200, { message: 'La ubicacion no puede exceder 200 caracteres' })
  ubicacion: string;

  @ApiProperty({
    description: 'Nombre del responsable del activo',
    example: 'Juan Carlos Rodriguez',
  })
  @IsString()
  @MinLength(3, { message: 'El nombre del responsable debe tener al menos 3 caracteres' })
  @MaxLength(150, { message: 'El nombre del responsable no puede exceder 150 caracteres' })
  responsable: string;

  @ApiPropertyOptional({
    description: 'URL de la imagen del activo',
    example: 'https://example.com/assets/laptop-001.jpg',
  })
  @IsUrl({}, { message: 'La URL de imagen debe ser valida' })
  @IsOptional()
  imagenUrl?: string;

  @ApiPropertyOptional({
    description: 'Numero de serie del activo',
    example: 'SN-DELL-2024-ABC123',
  })
  @IsString()
  @IsOptional()
  @MaxLength(100, { message: 'El numero de serie no puede exceder 100 caracteres' })
  numeroSerie?: string;

  @ApiPropertyOptional({
    description: 'Nombre del proveedor',
    example: 'Dell Technologies Colombia',
  })
  @IsString()
  @IsOptional()
  @MaxLength(200, { message: 'El nombre del proveedor no puede exceder 200 caracteres' })
  proveedor?: string;
}
