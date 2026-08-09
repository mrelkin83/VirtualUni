import {
  IsString,
  IsOptional,
  IsEnum,
  IsArray,
  IsDateString,
  MinLength,
  MaxLength,
  ArrayMinSize,
  ArrayMaxSize,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * DTO para la creación de mensajes masivos
 */
export class CreateMassMessageDto {
  @ApiProperty({
    description: 'Asunto del mensaje',
    example: 'Cambio de horario de clases',
    minLength: 5,
    maxLength: 200,
  })
  @IsString()
  @MinLength(5, { message: 'El asunto debe tener al menos 5 caracteres' })
  @MaxLength(200, { message: 'El asunto no puede exceder 200 caracteres' })
  asunto: string;

  @ApiProperty({
    description: 'Contenido del mensaje',
    example: 'A partir del próximo lunes, el horario cambiará...',
    minLength: 10,
  })
  @IsString()
  @MinLength(10, { message: 'El contenido debe tener al menos 10 caracteres' })
  contenido: string;

  @ApiPropertyOptional({
    description: 'Roles a quienes enviar el mensaje',
    example: ['STUDENT', 'TEACHER'],
    isArray: true,
  })
  @IsOptional()
  @IsArray()
  @ArrayMinSize(1, { message: 'Debe seleccionar al menos un rol o usuario' })
  @IsString({ each: true })
  targetRoles?: string[];

  @ApiPropertyOptional({
    description: 'IDs de usuarios específicos a quienes enviar',
    example: ['uuid-1', 'uuid-2'],
    isArray: true,
  })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(1000, { message: 'No se pueden seleccionar más de 1000 usuarios' })
  @IsString({ each: true })
  targetUsers?: string[];

  @ApiPropertyOptional({
    description: 'Array de adjuntos (URLs)',
    example: ['https://example.com/document.pdf'],
    isArray: true,
  })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(5, { message: 'No se pueden adjuntar más de 5 archivos' })
  @IsString({ each: true })
  adjuntos?: string[];

  @ApiPropertyOptional({
    description: 'Fecha y hora para programar el envío. Si no se proporciona, se envía inmediatamente.',
    example: '2024-12-25T10:00:00Z',
  })
  @IsOptional()
  @IsDateString()
  programado?: string;
}
