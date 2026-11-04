import {
  ArrayUnique,
  IsArray,
  IsDateString,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Min,
  ValidateIf,
} from 'class-validator';
import { ApiProperty, PartialType } from '@nestjs/swagger';
import { SubjectType } from '@prisma/client';

export class CrearPensumDto {
  @ApiProperty({ example: 'v1', description: 'Versión del pensum ("2027-1", "v2")' })
  @IsString()
  @IsNotEmpty()
  version: string;

  @ApiProperty({ required: false })
  @IsDateString()
  @IsOptional()
  validFrom?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  notes?: string;
}

export class ActualizarPensumDto extends PartialType(CrearPensumDto) {}

export class DuplicarPensumDto {
  @ApiProperty({ example: 'v2', description: 'Versión de la copia nueva' })
  @IsString()
  @IsNotEmpty()
  version: string;
}

export class CrearFilaPensumDto {
  @ApiProperty({ description: 'Asignatura del catálogo del tenant' })
  @IsUUID()
  subjectId: string;

  @ApiProperty({ example: 1, description: 'Semestre/grado/ciclo/módulo (1..n)' })
  @IsInt()
  @Min(1)
  level: number;

  @ApiProperty({ enum: SubjectType, required: false })
  @IsEnum(SubjectType, {
    message: `El tipo debe ser uno de: ${Object.values(SubjectType).join(', ')}`,
  })
  @IsOptional()
  subjectType?: SubjectType;

  @ApiProperty({ required: false, description: 'Override de los créditos de la Subject' })
  @IsInt()
  @Min(0)
  @IsOptional()
  credits?: number;

  @ApiProperty({ required: false })
  @IsInt()
  @Min(0)
  @IsOptional()
  hours?: number;

  @ApiProperty({ required: false, description: 'Horas teóricas (ETDH)' })
  @IsInt()
  @Min(0)
  @IsOptional()
  theoreticalHours?: number;

  @ApiProperty({ required: false, description: 'Horas prácticas (ETDH)' })
  @IsInt()
  @Min(0)
  @IsOptional()
  practicalHours?: number;

  @ApiProperty({
    required: false,
    description: 'Bloque de competencia del MISMO pensum',
  })
  @IsUUID()
  @IsOptional()
  blockId?: string;

  @ApiProperty({ required: false })
  @IsInt()
  @Min(0)
  @IsOptional()
  orderIndex?: number;
}

export class ActualizarFilaPensumDto {
  // subjectId no se cambia en una fila existente: se elimina la fila y se
  // agrega otra. Así los prerrequisitos nunca apuntan a una asignatura
  // distinta de la que se aprobó.
  @ApiProperty({ example: 1, required: false })
  @IsInt()
  @Min(1)
  @IsOptional()
  level?: number;

  @ApiProperty({ enum: SubjectType, required: false })
  @IsEnum(SubjectType, {
    message: `El tipo debe ser uno de: ${Object.values(SubjectType).join(', ')}`,
  })
  @IsOptional()
  subjectType?: SubjectType;

  @ApiProperty({ required: false })
  @IsInt()
  @Min(0)
  @IsOptional()
  credits?: number;

  @ApiProperty({ required: false })
  @IsInt()
  @Min(0)
  @IsOptional()
  hours?: number;

  @ApiProperty({ required: false, description: 'Horas teóricas (ETDH)' })
  @IsInt()
  @Min(0)
  @IsOptional()
  theoreticalHours?: number;

  @ApiProperty({ required: false, description: 'Horas prácticas (ETDH)' })
  @IsInt()
  @Min(0)
  @IsOptional()
  practicalHours?: number;

  @ApiProperty({
    required: false,
    description: 'Bloque de competencia del MISMO pensum; null lo desasigna',
  })
  // null es un valor válido aquí: desasigna el bloque de la fila.
  @ValidateIf((dto: ActualizarFilaPensumDto) => dto.blockId !== null)
  @IsUUID()
  @IsOptional()
  blockId?: string | null;

  @ApiProperty({ required: false })
  @IsInt()
  @Min(0)
  @IsOptional()
  orderIndex?: number;
}

export class PrerrequisitosDto {
  @ApiProperty({
    type: [String],
    description: 'Ids de filas del MISMO pensum que deben aprobarse antes',
  })
  @IsArray()
  @ArrayUnique()
  @IsUUID('4', { each: true })
  requiredIds: string[];
}
