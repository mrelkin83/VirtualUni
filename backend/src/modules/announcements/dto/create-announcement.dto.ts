import {
  IsString,
  IsOptional,
  IsEnum,
  IsArray,
  MinLength,
  MaxLength,
  ValidateNested,
  ArrayMinSize,
  ArrayMaxSize,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AnnouncementPriority, UserRole } from '@prisma/client';
import { Type } from 'class-transformer';

/**
 * DTO para la creación de anuncios
 */
export class CreateAnnouncementDto {
  @ApiProperty({
    description: 'Titulo del anuncio',
    example: 'Cambio de horario de clases',
    minLength: 5,
    maxLength: 200,
  })
  @IsString()
  @MinLength(5, { message: 'El titulo debe tener al menos 5 caracteres' })
  @MaxLength(200, { message: 'El titulo no puede exceder 200 caracteres' })
  titulo: string;

  @ApiProperty({
    description: 'Contenido del anuncio',
    example: 'A partir del próximo lunes, el horario de clases cambiará...',
    minLength: 10,
  })
  @IsString()
  @MinLength(10, { message: 'El contenido debe tener al menos 10 caracteres' })
  contenido: string;

  @ApiProperty({
    description: 'Prioridad del anuncio',
    enum: AnnouncementPriority,
    example: AnnouncementPriority.ALTA,
  })
  @IsEnum(AnnouncementPriority, {
    message: `La prioridad debe ser una de: ${Object.values(AnnouncementPriority).join(', ')}`,
  })
  prioridad: AnnouncementPriority;

  @ApiPropertyOptional({
    description: 'Array de adjuntos (URLs)',
    example: ['https://example.com/document.pdf'],
    isArray: true,
  })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(5, { message: 'No se pueden adjuntar más de 5 archivos' })
  @IsString({ each: true })
  adjuntos?: string[];

  @ApiPropertyOptional({
    description: 'Roles objetivo para el anuncio',
    enum: ['STUDENT', 'TEACHER', 'ADMIN', 'ALL'],
    example: ['STUDENT', 'TEACHER'],
    isArray: true,
  })
  @IsOptional()
  @IsArray()
  @ArrayMinSize(1, { message: 'Debe seleccionar al menos un rol' })
  @IsString({ each: true })
  targetRoles?: string[];

  @ApiPropertyOptional({
    description: 'Publicar inmediatamente',
    example: true,
  })
  @IsOptional()
  publicar?: boolean;
}
