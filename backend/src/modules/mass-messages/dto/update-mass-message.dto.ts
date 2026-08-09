import {
  IsString,
  IsOptional,
  IsArray,
  IsDateString,
  MinLength,
  MaxLength,
  ArrayMaxSize,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

/**
 * DTO para la actualización de mensajes masivos
 */
export class UpdateMassMessageDto {
  @ApiPropertyOptional({
    description: 'Asunto del mensaje',
    minLength: 5,
    maxLength: 200,
  })
  @IsOptional()
  @IsString()
  @MinLength(5)
  @MaxLength(200)
  asunto?: string;

  @ApiPropertyOptional({
    description: 'Contenido del mensaje',
    minLength: 10,
  })
  @IsOptional()
  @IsString()
  @MinLength(10)
  contenido?: string;

  @ApiPropertyOptional({
    description: 'Roles a quienes enviar el mensaje',
    isArray: true,
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  targetRoles?: string[];

  @ApiPropertyOptional({
    description: 'IDs de usuarios específicos',
    isArray: true,
  })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(1000)
  @IsString({ each: true })
  targetUsers?: string[];

  @ApiPropertyOptional({
    description: 'Array de adjuntos (URLs)',
    isArray: true,
  })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(5)
  @IsString({ each: true })
  adjuntos?: string[];

  @ApiPropertyOptional({
    description: 'Fecha y hora para programar el envío',
  })
  @IsOptional()
  @IsDateString()
  programado?: string;
}
