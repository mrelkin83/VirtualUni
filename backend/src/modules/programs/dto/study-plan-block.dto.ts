import {
  ArrayUnique,
  IsArray,
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
} from 'class-validator';
import { ApiProperty, PartialType } from '@nestjs/swagger';

export class CrearBloqueDto {
  @ApiProperty({ example: 'Módulo Contable-Financiero' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  name: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  @MaxLength(1000)
  description?: string;

  @ApiProperty({ required: false, example: 0 })
  @IsInt()
  @Min(0)
  @IsOptional()
  orderIndex?: number;

  @ApiProperty({
    required: false,
    default: true,
    description: 'Si al completarlo se puede emitir un certificado intermedio',
  })
  @IsBoolean()
  @IsOptional()
  certifiable?: boolean;

  @ApiProperty({
    required: false,
    description: 'Plantilla de certificado del tenant para este bloque',
  })
  @IsUUID()
  @IsOptional()
  certificateTemplateId?: string;

  @ApiProperty({
    required: false,
    description: 'Código de la norma de competencia laboral',
  })
  @IsString()
  @IsOptional()
  @MaxLength(60)
  competencyStandardCode?: string;
}

export class ActualizarBloqueDto extends PartialType(CrearBloqueDto) {}

export class AsignarAsignaturasDto {
  @ApiProperty({
    type: [String],
    description: 'Ids de filas del MISMO pensum que componen el bloque',
  })
  @IsArray()
  @ArrayUnique()
  @IsUUID('4', { each: true })
  studyPlanSubjectIds: string[];
}

export class EmitirCertificadoDeBloqueDto {
  @ApiProperty({ description: 'Estudiante que completó el bloque' })
  @IsUUID()
  studentId: string;

  @ApiProperty({ required: false, description: 'Observaciones del certificado' })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  observaciones?: string;
}
