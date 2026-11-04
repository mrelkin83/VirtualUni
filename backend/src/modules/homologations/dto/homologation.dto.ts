import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { HomologationStatus, HomologationType } from '@prisma/client';

// ---------------------------------------------------------------
// Equivalencias entre asignaturas
// ---------------------------------------------------------------

export class CrearEquivalenciaDto {
  @ApiProperty({ description: 'Asignatura aprobada (origen)' })
  @IsUUID()
  sourceSubjectId: string;

  @ApiProperty({ description: 'Asignatura que se da por aprobada (destino)' })
  @IsUUID()
  targetSubjectId: string;

  @ApiPropertyOptional({
    description: 'Si la equivalencia vale en los dos sentidos',
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  bidirectional?: boolean;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  @MaxLength(500)
  notes?: string;
}

export class ActualizarEquivalenciaDto {
  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  bidirectional?: boolean;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  @MaxLength(500)
  notes?: string;
}

// ---------------------------------------------------------------
// Solicitudes de homologación
// ---------------------------------------------------------------

export class ItemDeSolicitudDto {
  @ApiProperty({
    description: 'Asignatura del pensum destino que se pide homologar',
  })
  @IsUUID()
  targetSubjectId: string;

  @ApiPropertyOptional({
    description: 'Nombre de la asignatura en la institución de origen',
  })
  @IsString()
  @IsOptional()
  @MaxLength(200)
  originName?: string;

  @ApiPropertyOptional({ example: 64 })
  @IsInt()
  @Min(0)
  @Max(10000)
  @IsOptional()
  originHours?: number;

  @ApiPropertyOptional({ example: 4.2, description: 'Nota en la escala de origen' })
  @IsNumber()
  @Min(0)
  @Max(100)
  @IsOptional()
  originGrade?: number;
}

export class CrearSolicitudDto {
  @ApiProperty()
  @IsUUID()
  studentId: string;

  @ApiProperty({ description: 'Inscripción al programa DESTINO' })
  @IsUUID()
  programEnrollmentId: string;

  @ApiProperty({ enum: HomologationType })
  @IsEnum(HomologationType, {
    message: `El tipo debe ser uno de: ${Object.values(HomologationType).join(', ')}`,
  })
  type: HomologationType;

  @ApiPropertyOptional({
    description: 'Institución donde cursó (homologación externa)',
  })
  @IsString()
  @IsOptional()
  @MaxLength(200)
  originInstitution?: string;

  @ApiPropertyOptional({
    description: 'URLs de los soportes, subidas por el módulo de uploads',
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  @ArrayMaxSize(20)
  @IsOptional()
  supportFiles?: string[];

  @ApiProperty({ type: [ItemDeSolicitudDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(50)
  @ValidateNested({ each: true })
  @Type(() => ItemDeSolicitudDto)
  items: ItemDeSolicitudDto[];
}

export class CambiarEstadoSolicitudDto {
  @ApiProperty({
    enum: [HomologationStatus.EN_REVISION, HomologationStatus.RECHAZADA],
  })
  @IsEnum(HomologationStatus, {
    message: `El estado debe ser uno de: ${Object.values(HomologationStatus).join(', ')}`,
  })
  status: HomologationStatus;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  @MaxLength(1000)
  decisionNotes?: string;
}

export class DecisionDeItemDto {
  @ApiProperty()
  @IsUUID()
  itemId: string;

  @ApiProperty({ description: 'true aprueba el ítem, false lo rechaza' })
  @IsBoolean()
  aprobado: boolean;

  @ApiPropertyOptional({
    description:
      'Obligatoria cuando se fuerza la aprobación saltándose una validación',
  })
  @IsString()
  @IsOptional()
  @MaxLength(1000)
  justificacion?: string;

  @ApiPropertyOptional({
    description:
      'Aprobar aunque falle una validación (nota, horas o % máximo). Exige justificación',
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  forzar?: boolean;
}

export class ResolverSolicitudDto {
  @ApiProperty({ type: [DecisionDeItemDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(50)
  @ValidateNested({ each: true })
  @Type(() => DecisionDeItemDto)
  decisiones: DecisionDeItemDto[];

  @ApiPropertyOptional({ description: 'Observaciones de la decisión' })
  @IsString()
  @IsOptional()
  @MinLength(5)
  @MaxLength(1000)
  decisionNotes?: string;
}
