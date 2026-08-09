import {
  IsString,
  IsOptional,
  IsUUID,
  IsInt,
  Matches,
  MinLength,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';

const HORA_REGEX = /^([01]\d|2[0-3]):([0-5]\d)$/;

export class CreateScheduleEventDto {
  @ApiPropertyOptional({ description: 'Curso asociado al evento' })
  @IsUUID('4', { message: 'El curso debe ser un UUID valido' })
  @IsOptional()
  courseId?: string;

  @ApiProperty({ description: 'Titulo del evento', example: 'Calculo I' })
  @IsString()
  @MinLength(2, { message: 'El titulo debe tener al menos 2 caracteres' })
  titulo: string;

  @ApiPropertyOptional({ description: 'Tipo de evento', default: 'clase' })
  @IsString()
  @IsOptional()
  tipo?: string;

  @ApiProperty({
    description: 'Dia de la semana (1 = lunes ... 7 = domingo)',
    example: 1,
    minimum: 1,
    maximum: 7,
  })
  @Type(() => Number)
  @IsInt({ message: 'El dia de la semana debe ser un numero entero' })
  @Min(1, { message: 'El dia de la semana debe estar entre 1 y 7' })
  @Max(7, { message: 'El dia de la semana debe estar entre 1 y 7' })
  diaSemana: number;

  @ApiProperty({ description: 'Hora de inicio (HH:mm)', example: '08:00' })
  @Matches(HORA_REGEX, { message: 'La hora de inicio debe tener formato HH:mm' })
  horaInicio: string;

  @ApiProperty({ description: 'Hora de fin (HH:mm)', example: '10:00' })
  @Matches(HORA_REGEX, { message: 'La hora de fin debe tener formato HH:mm' })
  horaFin: string;

  @ApiPropertyOptional({ description: 'Aula', example: 'Bloque A - 301' })
  @IsString()
  @IsOptional()
  aula?: string;

  @ApiPropertyOptional({ description: 'Color de la tarjeta', example: 'bg-blue-500' })
  @IsString()
  @IsOptional()
  color?: string;
}

export class UpdateScheduleEventDto extends PartialType(CreateScheduleEventDto) {}
