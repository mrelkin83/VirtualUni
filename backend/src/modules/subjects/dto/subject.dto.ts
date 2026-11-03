import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { ApiProperty, PartialType } from '@nestjs/swagger';

/**
 * Asignaturas del catálogo transversal del tenant. Una Subject no pertenece a
 * ningún programa: aparece en el pensum de N programas vía StudyPlanSubject y
 * los grupos (Course) que la dictan comparten su contenido maestro.
 */
export class CrearAsignaturaDto {
  @ApiProperty({ example: 'MAT-BAS' })
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiProperty({ example: 'Matemáticas Básicas' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: 'Matemáticas', required: false })
  @IsString()
  @IsOptional()
  area?: string;

  @ApiProperty({ example: 3, required: false })
  @IsInt()
  @Min(0)
  @IsOptional()
  credits?: number;

  @ApiProperty({ example: 64, required: false, description: 'Horas totales' })
  @IsInt()
  @Min(0)
  @IsOptional()
  hours?: number;

  @ApiProperty({ example: 4, required: false })
  @IsInt()
  @Min(0)
  @IsOptional()
  weeklyHours?: number;
}

export class ActualizarAsignaturaDto extends PartialType(CrearAsignaturaDto) {
  @ApiProperty({ example: 'active', required: false })
  @IsString()
  @IsOptional()
  status?: string;
}
