import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { ApiProperty, PartialType } from '@nestjs/swagger';
import {
  AcademicUnit,
  EducationLevel,
  Modality,
  PeriodStructure,
  ProgramStatus,
} from '@prisma/client';

export class CrearProgramaDto {
  @ApiProperty({ example: 'TEC-SOFT' })
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiProperty({ example: 'Tecnólogo en Desarrollo de Software' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ enum: EducationLevel })
  @IsEnum(EducationLevel, {
    message: `El nivel debe ser uno de: ${Object.values(EducationLevel).join(', ')}`,
  })
  educationLevel: EducationLevel;

  @ApiProperty({ enum: Modality })
  @IsEnum(Modality, {
    message: `La modalidad debe ser una de: ${Object.values(Modality).join(', ')}`,
  })
  modality: Modality;

  @ApiProperty({ enum: PeriodStructure })
  @IsEnum(PeriodStructure, {
    message: `La periodicidad debe ser una de: ${Object.values(PeriodStructure).join(', ')}`,
  })
  periodStructure: PeriodStructure;

  @ApiProperty({ enum: AcademicUnit })
  @IsEnum(AcademicUnit, {
    message: `La unidad debe ser una de: ${Object.values(AcademicUnit).join(', ')}`,
  })
  academicUnit: AcademicUnit;

  @ApiProperty({ example: 6, required: false, description: 'Nº de semestres/grados/ciclos/módulos' })
  @IsInt()
  @Min(1)
  @IsOptional()
  durationPeriods?: number;

  @ApiProperty({ example: 96, required: false })
  @IsInt()
  @Min(0)
  @IsOptional()
  totalCredits?: number;

  @ApiProperty({ example: 1200, required: false })
  @IsInt()
  @Min(0)
  @IsOptional()
  totalHours?: number;

  @ApiProperty({ example: 'Tecnólogo en Desarrollo de Software', required: false })
  @IsString()
  @IsOptional()
  degreeTitle?: string;

  @ApiProperty({ required: false, description: 'SNIES o registro ETDH' })
  @IsString()
  @IsOptional()
  officialCode?: string;

  @ApiProperty({ required: false, description: 'Resolución / registro calificado' })
  @IsString()
  @IsOptional()
  approvalAct?: string;

  @ApiProperty({ enum: ProgramStatus, required: false })
  @IsEnum(ProgramStatus, {
    message: `El estado debe ser uno de: ${Object.values(ProgramStatus).join(', ')}`,
  })
  @IsOptional()
  status?: ProgramStatus;
}

export class ActualizarProgramaDto extends PartialType(CrearProgramaDto) {}
