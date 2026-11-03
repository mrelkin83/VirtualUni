import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Modality } from '@prisma/client';

/**
 * Un Course es un GRUPO: una asignatura dictada en un periodo por un docente.
 * Con `subjectId`, el código/nombre/créditos se derivan de la Subject (el
 * cliente no los manda); sin él, siguen siendo obligatorios (flujo legado).
 */
export class CreateCourseDto {
  @ApiProperty({ example: 'CS101', required: false, description: 'Obligatorio si no hay subjectId' })
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  code?: string;

  @ApiProperty({ example: 'Introducción a la Programación', required: false, description: 'Obligatorio si no hay subjectId' })
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  name?: string;

  @ApiProperty({ example: 'Curso básico de programación en Python', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: 4, required: false })
  @IsInt()
  @Min(1)
  @IsOptional()
  credits?: number;

  @ApiProperty({ example: '2024-1', required: false })
  @IsString()
  @IsOptional()
  semester?: string;

  @ApiProperty({ example: 'bg-blue-500', required: false })
  @IsString()
  @IsOptional()
  color?: string;

  @ApiProperty({ example: 'teacher-uuid-here' })
  @IsUUID()
  @IsNotEmpty()
  teacherId: string;

  @ApiProperty({ required: false, description: 'Asignatura del catálogo que dicta este grupo' })
  @IsUUID()
  @IsOptional()
  subjectId?: string;

  @ApiProperty({ required: false, description: 'Periodo académico en que se dicta' })
  @IsUUID()
  @IsOptional()
  academicPeriodId?: string;

  @ApiProperty({ example: 'A', required: false })
  @IsString()
  @IsOptional()
  groupCode?: string;

  @ApiProperty({ example: 30, required: false })
  @IsInt()
  @Min(1)
  @IsOptional()
  capacity?: number;

  @ApiProperty({ enum: Modality, required: false })
  @IsEnum(Modality, {
    message: `La modalidad debe ser una de: ${Object.values(Modality).join(', ')}`,
  })
  @IsOptional()
  modality?: Modality;
}
