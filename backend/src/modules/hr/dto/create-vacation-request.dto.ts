import {
  IsString,
  IsUUID,
  IsDateString,
  MinLength,
  MaxLength,
  IsNotEmpty,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO para crear una solicitud de vacaciones
 * Los dias solicitados se calculan automaticamente en el servicio
 */
export class CreateVacationRequestDto {
  @ApiProperty({
    description: 'ID del empleado que solicita las vacaciones',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID('4', { message: 'El ID del empleado debe ser un UUID valido' })
  @IsNotEmpty({ message: 'El ID del empleado es requerido' })
  empleadoId: string;

  @ApiProperty({
    description: 'Fecha de inicio de las vacaciones en formato ISO',
    example: '2024-12-20',
  })
  @IsDateString({}, { message: 'La fecha de inicio debe ser una fecha valida en formato ISO' })
  @IsNotEmpty({ message: 'La fecha de inicio es requerida' })
  fechaInicio: string;

  @ApiProperty({
    description: 'Fecha de fin de las vacaciones en formato ISO (debe ser >= fechaInicio)',
    example: '2024-12-31',
  })
  @IsDateString({}, { message: 'La fecha de fin debe ser una fecha valida en formato ISO' })
  @IsNotEmpty({ message: 'La fecha de fin es requerida' })
  fechaFin: string;

  @ApiProperty({
    description: 'Motivo o justificacion de la solicitud de vacaciones',
    example: 'Vacaciones familiares de fin de ano',
    minLength: 10,
    maxLength: 1000,
  })
  @IsString()
  @IsNotEmpty({ message: 'El motivo es requerido' })
  @MinLength(10, { message: 'El motivo debe tener al menos 10 caracteres' })
  @MaxLength(1000, { message: 'El motivo no puede exceder 1000 caracteres' })
  motivo: string;
}
