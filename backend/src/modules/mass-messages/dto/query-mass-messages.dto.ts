import { IsOptional, IsEnum, IsString, IsNumberString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { MessageStatus } from '@prisma/client';

/**
 * DTO para queries de mensajes masivos con filtros y paginación
 */
export class QueryMassMessagesDto {
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
    description: 'Búsqueda por asunto o contenido',
    example: 'cambio de horario',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: 'Filtro por estado',
    enum: MessageStatus,
  })
  @IsOptional()
  @IsEnum(MessageStatus)
  estado?: MessageStatus;

  @ApiPropertyOptional({
    description: 'Ordenamiento',
    example: 'createdAt:DESC',
    enum: [
      'createdAt:ASC',
      'createdAt:DESC',
      'enviado_at:ASC',
      'enviado_at:DESC',
      'asunto:ASC',
      'asunto:DESC',
    ],
  })
  @IsOptional()
  @IsString()
  orderBy?: string;
}
