import { IsString, IsOptional, IsDateString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

/**
 * DTO para filtrar el listado de registros de asistencia
 */
export class QueryAttendanceDto {
  @ApiPropertyOptional({
    description: 'Filtrar por ID del curso',
    example: '3f2504e0-4f89-11d3-9a0c-0305e82c3301',
  })
  @IsOptional()
  @IsString()
  courseId?: string;

  @ApiPropertyOptional({
    description: 'Filtrar por fecha exacta (formato YYYY-MM-DD)',
    example: '2026-07-19',
  })
  @IsOptional()
  @IsDateString()
  fecha?: string;

  @ApiPropertyOptional({
    description: 'Fecha inicial del rango (formato YYYY-MM-DD)',
    example: '2026-07-01',
  })
  @IsOptional()
  @IsDateString()
  from?: string;

  @ApiPropertyOptional({
    description: 'Fecha final del rango (formato YYYY-MM-DD)',
    example: '2026-07-31',
  })
  @IsOptional()
  @IsDateString()
  to?: string;
}
