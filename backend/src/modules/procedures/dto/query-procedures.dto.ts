import { IsOptional, IsEnum, IsString, IsNumberString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { ProcedureStatus, Priority } from '@prisma/client';

/**
 * DTO para queries de trámites con filtros y paginación
 */
export class QueryProceduresDto {
  @ApiPropertyOptional({
    description: 'Numero de página',
    example: 1,
  })
  @IsOptional()
  @IsNumberString()
  page?: string;

  @ApiPropertyOptional({
    description: 'Items por página',
    example: 10,
  })
  @IsOptional()
  @IsNumberString()
  limit?: string;

  @ApiPropertyOptional({
    description: 'Búsqueda por tipo o descripción',
    example: 'certificado',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: 'Filtro por estado',
    enum: ProcedureStatus,
  })
  @IsOptional()
  @IsEnum(ProcedureStatus)
  estado?: ProcedureStatus;

  @ApiPropertyOptional({
    description: 'Filtro por prioridad',
    enum: Priority,
  })
  @IsOptional()
  @IsEnum(Priority)
  prioridad?: Priority;

  @ApiPropertyOptional({
    description: 'Filtro por tipo de trámite',
    example: 'Solicitud de certificado',
  })
  @IsOptional()
  @IsString()
  tipo?: string;

  @ApiPropertyOptional({
    description: 'Filtro por solicitante',
    example: 'uuid-string',
  })
  @IsOptional()
  @IsString()
  solicitanteId?: string;

  @ApiPropertyOptional({
    description: 'Filtro por asignado a',
    example: 'uuid-string',
  })
  @IsOptional()
  @IsString()
  asignadoA?: string;

  @ApiPropertyOptional({
    description: 'Ordenamiento',
    example: 'fechaSolicitud:DESC',
    enum: [
      'fechaSolicitud:ASC',
      'fechaSolicitud:DESC',
      'prioridad:ASC',
      'prioridad:DESC',
      'estado:ASC',
      'estado:DESC',
    ],
  })
  @IsOptional()
  @IsString()
  orderBy?: string;
}
