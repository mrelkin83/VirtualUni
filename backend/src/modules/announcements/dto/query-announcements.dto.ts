import { IsOptional, IsEnum, IsString, IsNumberString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { AnnouncementPriority, AnnouncementStatus } from '@prisma/client';

/**
 * DTO para queries de anuncios con filtros y paginación
 */
export class QueryAnnouncementsDto {
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
    description: 'Busqueda por titulo o contenido',
    example: 'cambio de horario',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: 'Filtro por prioridad',
    enum: AnnouncementPriority,
  })
  @IsOptional()
  @IsEnum(AnnouncementPriority)
  prioridad?: AnnouncementPriority;

  @ApiPropertyOptional({
    description: 'Filtro por estado',
    enum: AnnouncementStatus,
  })
  @IsOptional()
  @IsEnum(AnnouncementStatus)
  estado?: AnnouncementStatus;

  @ApiPropertyOptional({
    description: 'Ordenamiento',
    example: 'createdAt:DESC',
    enum: [
      'createdAt:ASC',
      'createdAt:DESC',
      'prioridad:ASC',
      'prioridad:DESC',
      'titulo:ASC',
      'titulo:DESC',
    ],
  })
  @IsOptional()
  @IsString()
  orderBy?: string;
}
