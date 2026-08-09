import {
  IsString,
  IsOptional,
  IsEnum,
  IsInt,
  IsUUID,
  IsDateString,
  MinLength,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { LiveClassStatus } from '@prisma/client';

export class CreateLiveClassDto {
  @ApiProperty({ description: 'ID del curso' })
  @IsUUID('4', { message: 'El curso debe ser un UUID valido' })
  courseId: string;

  @ApiProperty({ description: 'Titulo de la clase', example: 'Clase 3: Estructuras de datos' })
  @IsString()
  @MinLength(3, { message: 'El titulo debe tener al menos 3 caracteres' })
  titulo: string;

  @ApiPropertyOptional({ description: 'Descripcion de la clase' })
  @IsString()
  @IsOptional()
  descripcion?: string;

  @ApiProperty({ description: 'Fecha y hora de inicio (ISO)' })
  @IsDateString({}, { message: 'La fecha de inicio debe ser una fecha valida' })
  fechaInicio: string;

  @ApiPropertyOptional({ description: 'Fecha y hora de fin (ISO)' })
  @IsDateString({}, { message: 'La fecha de fin debe ser una fecha valida' })
  @IsOptional()
  fechaFin?: string;

  @ApiPropertyOptional({ description: 'Enlace de la videoconferencia' })
  @IsString()
  @IsOptional()
  enlace?: string;

  @ApiPropertyOptional({ description: 'Plataforma', example: 'Zoom' })
  @IsString()
  @IsOptional()
  plataforma?: string;

  @ApiPropertyOptional({ description: 'Aula fisica o virtual' })
  @IsString()
  @IsOptional()
  aula?: string;

  @ApiPropertyOptional({ description: 'Estado de la clase', enum: LiveClassStatus })
  @IsEnum(LiveClassStatus, { message: 'El estado de la clase no es valido' })
  @IsOptional()
  estado?: LiveClassStatus;

  @ApiPropertyOptional({ description: 'URL de la grabacion' })
  @IsString()
  @IsOptional()
  grabacionUrl?: string;

  @ApiPropertyOptional({ description: 'Duracion en minutos' })
  @Type(() => Number)
  @IsInt({ message: 'La duracion debe ser un numero entero' })
  @Min(1, { message: 'La duracion debe ser mayor a 0' })
  @IsOptional()
  duracionMinutos?: number;
}

export class UpdateLiveClassDto extends PartialType(CreateLiveClassDto) {}

export class QueryLiveClassesDto {
  @ApiPropertyOptional({ description: 'Filtrar por curso' })
  @IsUUID('4', { message: 'El curso debe ser un UUID valido' })
  @IsOptional()
  courseId?: string;

  @ApiPropertyOptional({ description: 'Filtrar por estado', enum: LiveClassStatus })
  @IsEnum(LiveClassStatus, { message: 'El estado de la clase no es valido' })
  @IsOptional()
  estado?: LiveClassStatus;

  @ApiPropertyOptional({ description: 'Solo clases con grabacion disponible' })
  @IsString()
  @IsOptional()
  soloGrabadas?: string;
}
