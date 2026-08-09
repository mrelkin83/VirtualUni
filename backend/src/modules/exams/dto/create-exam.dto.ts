import {
  IsString,
  IsOptional,
  IsInt,
  IsNumber,
  IsBoolean,
  IsArray,
  IsDateString,
  MinLength,
  MaxLength,
  Min,
  ArrayMinSize,
  ValidateNested,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

/**
 * DTO para una pregunta de examen
 */
export class ExamQuestionDto {
  @ApiProperty({
    description: 'Enunciado de la pregunta',
    example: '¿Cuál es la capital de Francia?',
  })
  @IsString()
  @MinLength(1, { message: 'La pregunta no puede estar vacía' })
  pregunta: string;

  @ApiProperty({
    description: 'Opciones de respuesta',
    example: ['Madrid', 'París', 'Roma'],
    isArray: true,
  })
  @IsArray()
  @ArrayMinSize(2, { message: 'Debe haber al menos 2 opciones' })
  @IsString({ each: true })
  opciones: string[];

  @ApiProperty({
    description: 'Índice (en opciones) de la respuesta correcta',
    example: 1,
  })
  @IsInt()
  @Min(0)
  respuestaCorrecta: number;

  @ApiPropertyOptional({
    description: 'Puntaje de la pregunta',
    example: 1,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  puntaje?: number;

  @ApiPropertyOptional({
    description: 'Orden de la pregunta',
    example: 0,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  orderIndex?: number;
}

/**
 * DTO para la creación de exámenes
 */
export class CreateExamDto {
  @ApiProperty({
    description: 'ID del curso al que pertenece el examen',
  })
  @IsString()
  courseId: string;

  @ApiProperty({
    description: 'Título del examen',
    example: 'Examen parcial de Matemáticas',
  })
  @IsString()
  @MinLength(1, { message: 'El título no puede estar vacío' })
  @MaxLength(200, { message: 'El título no puede exceder 200 caracteres' })
  titulo: string;

  @ApiPropertyOptional({
    description: 'Instrucciones del examen',
  })
  @IsOptional()
  @IsString()
  instrucciones?: string;

  @ApiProperty({
    description: 'Fecha del examen (ISO)',
    example: '2026-08-01T10:00:00.000Z',
  })
  @IsDateString()
  fecha: string;

  @ApiProperty({
    description: 'Duración del examen en minutos',
    example: 60,
  })
  @IsInt()
  @Min(1, { message: 'La duración debe ser de al menos 1 minuto' })
  duracion: number;

  @ApiPropertyOptional({
    description: 'Nota mínima para aprobar',
    example: 6,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  notaMinima?: number;

  @ApiPropertyOptional({
    description: 'Número de intentos permitidos',
    example: 1,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  intentosPermitidos?: number;

  @ApiPropertyOptional({
    description: 'Mostrar resultados al estudiante',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  mostrarResultados?: boolean;

  @ApiPropertyOptional({
    description: 'Mezclar el orden de las preguntas',
    example: false,
  })
  @IsOptional()
  @IsBoolean()
  mezclarPreguntas?: boolean;

  @ApiPropertyOptional({
    description: 'Preguntas del examen',
    type: [ExamQuestionDto],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ExamQuestionDto)
  preguntas?: ExamQuestionDto[];
}
