import {
  IsString,
  IsOptional,
  IsEnum,
  IsArray,
  MinLength,
  MaxLength,
  ArrayMaxSize,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { AnnouncementPriority } from '@prisma/client';

/**
 * DTO para la actualización de anuncios
 */
export class UpdateAnnouncementDto {
  @ApiPropertyOptional({
    description: 'Titulo del anuncio',
    minLength: 5,
    maxLength: 200,
  })
  @IsOptional()
  @IsString()
  @MinLength(5, { message: 'El titulo debe tener al menos 5 caracteres' })
  @MaxLength(200, { message: 'El titulo no puede exceder 200 caracteres' })
  titulo?: string;

  @ApiPropertyOptional({
    description: 'Contenido del anuncio',
    minLength: 10,
  })
  @IsOptional()
  @IsString()
  @MinLength(10, { message: 'El contenido debe tener al menos 10 caracteres' })
  contenido?: string;

  @ApiPropertyOptional({
    description: 'Prioridad del anuncio',
    enum: AnnouncementPriority,
  })
  @IsOptional()
  @IsEnum(AnnouncementPriority)
  prioridad?: AnnouncementPriority;

  @ApiPropertyOptional({
    description: 'Array de adjuntos (URLs)',
    isArray: true,
  })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(5, { message: 'No se pueden adjuntar más de 5 archivos' })
  @IsString({ each: true })
  adjuntos?: string[];

  @ApiPropertyOptional({
    description: 'Roles objetivo para el anuncio',
    isArray: true,
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  targetRoles?: string[];
}
