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
import { Priority } from '@prisma/client';

/**
 * DTO para la actualización de trámites
 */
export class UpdateProcedureDto {
  @ApiPropertyOptional({
    description: 'Tipo de trámite',
    minLength: 5,
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @MinLength(5)
  @MaxLength(100)
  tipo?: string;

  @ApiPropertyOptional({
    description: 'Descripción del trámite',
    minLength: 10,
  })
  @IsOptional()
  @IsString()
  @MinLength(10)
  descripcion?: string;

  @ApiPropertyOptional({
    description: 'Prioridad del trámite',
    enum: Priority,
  })
  @IsOptional()
  @IsEnum(Priority)
  prioridad?: Priority;

  @ApiPropertyOptional({
    description: 'Array de adjuntos (URLs)',
    isArray: true,
  })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(5)
  @IsString({ each: true })
  adjuntos?: string[];
}
