import {
  IsString,
  IsDateString,
  MinLength,
  MaxLength,
  IsOptional,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

/**
 * DTO para actualizar una solicitud de vacaciones
 * Solo permite modificar fechas y motivo mientras este en estado PENDIENTE
 * El cambio de estado se maneja mediante endpoints dedicados (approve/reject)
 */
export class UpdateVacationRequestDto {
  @ApiPropertyOptional({
    description: 'Nueva fecha de inicio de las vacaciones en formato ISO',
    example: '2024-12-22',
  })
  @IsDateString({}, { message: 'La fecha de inicio debe ser una fecha valida en formato ISO' })
  @IsOptional()
  fechaInicio?: string;

  @ApiPropertyOptional({
    description: 'Nueva fecha de fin de las vacaciones en formato ISO (debe ser >= fechaInicio)',
    example: '2025-01-02',
  })
  @IsDateString({}, { message: 'La fecha de fin debe ser una fecha valida en formato ISO' })
  @IsOptional()
  fechaFin?: string;

  @ApiPropertyOptional({
    description: 'Nuevo motivo o justificacion de la solicitud',
    example: 'Vacaciones extendidas por viaje familiar',
    minLength: 10,
    maxLength: 1000,
  })
  @IsString()
  @IsOptional()
  @MinLength(10, { message: 'El motivo debe tener al menos 10 caracteres' })
  @MaxLength(1000, { message: 'El motivo no puede exceder 1000 caracteres' })
  motivo?: string;
}
