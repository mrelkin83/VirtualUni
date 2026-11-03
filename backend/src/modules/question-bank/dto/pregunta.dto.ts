import { IsString, IsOptional, IsArray, IsNumber, IsInt, IsUUID, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CrearPreguntaDto {
  @ApiProperty()
  @IsString()
  pregunta: string;

  // Pregunta maestra de una asignatura: la comparten todos sus grupos.
  // Requiere ser editor de la asignatura (o administración).
  @ApiProperty({ required: false })
  @IsUUID()
  @IsOptional()
  subjectId?: string;

  @ApiProperty({ required: false, example: 'multiple' })
  @IsString()
  @IsOptional()
  tipo?: string;

  @ApiProperty({ required: false, type: [String] })
  @IsArray()
  @IsOptional()
  opciones?: string[];

  /** Índice dentro de `opciones`. Vacío en preguntas abiertas. */
  @ApiProperty({ required: false })
  @IsInt()
  @Min(0)
  @IsOptional()
  respuestaCorrecta?: number;

  @ApiProperty({ required: false })
  @IsNumber()
  @Min(0)
  @IsOptional()
  puntos?: number;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  categoria?: string;
}

export class ActualizarPreguntaDto extends CrearPreguntaDto {
  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  declare pregunta: string;
}
