import {
  IsString,
  IsOptional,
  IsEnum,
  IsArray,
  IsDateString,
  ValidateNested,
  ArrayMinSize,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AttendanceStatus } from '@prisma/client';
import { Type } from 'class-transformer';

/**
 * DTO para un registro individual de asistencia dentro de una carga masiva
 */
export class AttendanceRecordDto {
  @ApiProperty({
    description: 'ID del estudiante',
    example: '3f2504e0-4f89-11d3-9a0c-0305e82c3301',
  })
  @IsString()
  studentId: string;

  @ApiProperty({
    description: 'Estado de asistencia del estudiante',
    enum: AttendanceStatus,
    example: AttendanceStatus.PRESENTE,
  })
  @IsEnum(AttendanceStatus, {
    message: `El estado debe ser uno de: ${Object.values(AttendanceStatus).join(', ')}`,
  })
  estado: AttendanceStatus;

  @ApiPropertyOptional({
    description: 'Observación opcional sobre la asistencia',
    example: 'Llegó 10 minutos tarde',
  })
  @IsOptional()
  @IsString()
  observacion?: string;
}

/**
 * DTO para el registro masivo de asistencia de un curso en una fecha
 */
export class BulkAttendanceDto {
  @ApiProperty({
    description: 'ID del curso',
    example: '3f2504e0-4f89-11d3-9a0c-0305e82c3301',
  })
  @IsString()
  courseId: string;

  @ApiProperty({
    description: 'Fecha de la sesión (formato YYYY-MM-DD)',
    example: '2026-07-19',
  })
  @IsDateString()
  fecha: string;

  @ApiProperty({
    description: 'Lista de registros de asistencia',
    type: [AttendanceRecordDto],
    isArray: true,
  })
  @IsArray()
  @ArrayMinSize(1, { message: 'Debe incluir al menos un registro' })
  @ValidateNested({ each: true })
  @Type(() => AttendanceRecordDto)
  registros: AttendanceRecordDto[];
}
