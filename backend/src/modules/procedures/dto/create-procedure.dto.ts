import {
  IsString,
  IsOptional,
  IsEnum,
  IsArray,
  MinLength,
  MaxLength,
  ArrayMaxSize,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Priority } from '@prisma/client';

/**
 * DTO para la creación de trámites
 */
export class CreateProcedureDto {
  @ApiProperty({
    description: 'Tipo de trámite',
    example: 'Solicitud de certificado',
    minLength: 5,
    maxLength: 100,
  })
  @IsString()
  @MinLength(5, { message: 'El tipo debe tener al menos 5 caracteres' })
  @MaxLength(100, { message: 'El tipo no puede exceder 100 caracteres' })
  tipo: string;

  @ApiProperty({
    description: 'Descripción del trámite',
    example: 'Solicitar un certificado de calificaciones',
    minLength: 10,
  })
  @IsString()
  @MinLength(10, { message: 'La descripción debe tener al menos 10 caracteres' })
  descripcion: string;

  @ApiProperty({
    description: 'Prioridad del trámite',
    enum: Priority,
    example: Priority.MEDIA,
  })
  @IsEnum(Priority, {
    message: `La prioridad debe ser una de: ${Object.values(Priority).join(', ')}`,
  })
  prioridad: Priority;

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
}
