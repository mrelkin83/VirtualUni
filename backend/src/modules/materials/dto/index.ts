import {
  IsString,
  IsOptional,
  IsEnum,
  IsBoolean,
  IsInt,
  IsUUID,
  IsNotEmpty,
  MinLength,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { MaterialType } from '@prisma/client';

export class CreateMaterialDto {
  @ApiProperty({ description: 'ID del curso al que pertenece el material' })
  @IsUUID('4', { message: 'El curso debe ser un UUID valido' })
  courseId: string;

  @ApiPropertyOptional({ description: 'ID de la carpeta contenedora' })
  @IsUUID('4', { message: 'La carpeta debe ser un UUID valido' })
  @IsOptional()
  folderId?: string;

  @ApiProperty({ description: 'Nombre del material', example: 'Guia de laboratorio 1' })
  @IsString()
  @MinLength(2, { message: 'El nombre debe tener al menos 2 caracteres' })
  nombre: string;

  @ApiPropertyOptional({ description: 'Descripcion del material' })
  @IsString()
  @IsOptional()
  descripcion?: string;

  @ApiProperty({ description: 'Tipo de material', enum: MaterialType })
  @IsEnum(MaterialType, { message: 'El tipo de material no es valido' })
  tipo: MaterialType;

  @ApiProperty({ description: 'URL o ruta del material' })
  @IsString()
  @IsNotEmpty({ message: 'La URL es requerida' })
  url: string;

  @ApiPropertyOptional({ description: 'Formato del archivo', example: 'pdf' })
  @IsString()
  @IsOptional()
  formato?: string;

  @ApiPropertyOptional({ description: 'Tamanio en kilobytes' })
  @Type(() => Number)
  @IsInt({ message: 'El tamanio debe ser un numero entero' })
  @Min(0, { message: 'El tamanio no puede ser negativo' })
  @IsOptional()
  tamanioKb?: number;

  @ApiPropertyOptional({ description: 'Visible para los estudiantes', default: true })
  @IsBoolean()
  @IsOptional()
  visible?: boolean;
}

export class UpdateMaterialDto extends PartialType(CreateMaterialDto) {}

export class QueryMaterialsDto {
  @ApiPropertyOptional({ description: 'Filtrar por curso' })
  @IsUUID('4', { message: 'El curso debe ser un UUID valido' })
  @IsOptional()
  courseId?: string;

  @ApiPropertyOptional({ description: 'Filtrar por carpeta' })
  @IsUUID('4', { message: 'La carpeta debe ser un UUID valido' })
  @IsOptional()
  folderId?: string;

  @ApiPropertyOptional({ description: 'Filtrar por tipo', enum: MaterialType })
  @IsEnum(MaterialType, { message: 'El tipo de material no es valido' })
  @IsOptional()
  tipo?: MaterialType;

  @ApiPropertyOptional({ description: 'Buscar por nombre' })
  @IsString()
  @IsOptional()
  search?: string;
}

export class CreateFolderDto {
  @ApiPropertyOptional({ description: 'ID del curso al que pertenece la carpeta' })
  @IsUUID('4', { message: 'El curso debe ser un UUID valido' })
  @IsOptional()
  courseId?: string;

  @ApiProperty({ description: 'Nombre de la carpeta', example: 'Unidad 1' })
  @IsString()
  @MinLength(2, { message: 'El nombre debe tener al menos 2 caracteres' })
  nombre: string;

  @ApiPropertyOptional({ description: 'Descripcion de la carpeta' })
  @IsString()
  @IsOptional()
  descripcion?: string;

  @ApiPropertyOptional({ description: 'Color de la carpeta', example: 'bg-blue-500' })
  @IsString()
  @IsOptional()
  color?: string;
}

export class UpdateFolderDto extends PartialType(CreateFolderDto) {}
