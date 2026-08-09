import {
  IsString,
  IsBoolean,
  IsOptional,
  MinLength,
  MaxLength,
  ValidateIf,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * DTO para aprobar o rechazar una solicitud de vacaciones
 * Si se rechaza, el motivo de rechazo es obligatorio
 */
export class ApproveVacationDto {
  @ApiProperty({
    description: 'Indica si la solicitud es aprobada (true) o rechazada (false)',
    example: true,
  })
  @IsBoolean({ message: 'El campo aprobado debe ser un valor booleano' })
  aprobado: boolean;

  @ApiPropertyOptional({
    description: 'Motivo del rechazo (obligatorio si aprobado es false)',
    example: 'No hay personal suficiente para cubrir el puesto durante esas fechas',
    minLength: 10,
    maxLength: 500,
  })
  @ValidateIf((o) => o.aprobado === false)
  @IsString({ message: 'El motivo de rechazo debe ser un texto' })
  @MinLength(10, { message: 'El motivo de rechazo debe tener al menos 10 caracteres' })
  @MaxLength(500, { message: 'El motivo de rechazo no puede exceder 500 caracteres' })
  motivoRechazo?: string;

  @ApiPropertyOptional({
    description: 'Comentarios adicionales del aprobador',
    example: 'Aprobado. Recuerde coordinar con su equipo antes de salir.',
    maxLength: 500,
  })
  @IsString()
  @IsOptional()
  @MaxLength(500, { message: 'Los comentarios no pueden exceder 500 caracteres' })
  comentarios?: string;
}
