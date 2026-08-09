import {
  IsString,
  IsOptional,
  IsEnum,
  IsArray,
  MinLength,
  ArrayMaxSize,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ProcedureStatus } from '@prisma/client';

/**
 * DTO para responder a un trámite
 */
export class RespondProcedureDto {
  @ApiProperty({
    description: 'Respuesta al trámite',
    example: 'El certificado será entregado en 3 días hábiles',
    minLength: 10,
  })
  @IsString()
  @MinLength(10, { message: 'La respuesta debe tener al menos 10 caracteres' })
  respuesta: string;

  @ApiProperty({
    description: 'Estado del trámite después de responder',
    enum: ProcedureStatus,
    example: ProcedureStatus.EN_PROCESO,
  })
  @IsEnum(ProcedureStatus)
  estado: ProcedureStatus;

  @ApiPropertyOptional({
    description: 'Array de adjuntos para la respuesta (URLs)',
    example: ['https://example.com/response.pdf'],
    isArray: true,
  })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(5, { message: 'No se pueden adjuntar más de 5 archivos' })
  @IsString({ each: true })
  adjuntosRespuesta?: string[];
}
