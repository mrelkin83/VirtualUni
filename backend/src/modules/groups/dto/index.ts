import {
  IsString,
  IsOptional,
  IsInt,
  IsUUID,
  IsArray,
  MinLength,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';

export class CreateGroupDto {
  @ApiProperty({ description: 'ID del curso' })
  @IsUUID('4', { message: 'El curso debe ser un UUID valido' })
  courseId: string;

  @ApiProperty({ description: 'Nombre del grupo', example: 'Grupo A' })
  @IsString()
  @MinLength(1, { message: 'El nombre es requerido' })
  nombre: string;

  @ApiPropertyOptional({ description: 'Descripcion del grupo' })
  @IsString()
  @IsOptional()
  descripcion?: string;

  @ApiPropertyOptional({ description: 'Capacidad maxima de estudiantes' })
  @Type(() => Number)
  @IsInt({ message: 'La capacidad debe ser un numero entero' })
  @Min(1, { message: 'La capacidad debe ser mayor a 0' })
  @IsOptional()
  capacidadMaxima?: number;

  @ApiPropertyOptional({ description: 'Horario del grupo', example: 'Lunes 8:00 - 10:00' })
  @IsString()
  @IsOptional()
  horario?: string;

  @ApiPropertyOptional({ description: 'Aula asignada' })
  @IsString()
  @IsOptional()
  aula?: string;

  @ApiPropertyOptional({ description: 'Color de la tarjeta', example: 'bg-purple-500' })
  @IsString()
  @IsOptional()
  color?: string;
}

export class UpdateGroupDto extends PartialType(CreateGroupDto) {}

export class AddMembersDto {
  @ApiProperty({ description: 'IDs de los estudiantes a agregar', isArray: true })
  @IsArray({ message: 'Los estudiantes deben enviarse como arreglo' })
  @IsUUID('4', { each: true, message: 'Cada estudiante debe ser un UUID valido' })
  studentIds: string[];
}
