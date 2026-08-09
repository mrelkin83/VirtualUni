import {
  IsString,
  IsOptional,
  IsInt,
  Min,
  Max,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

/**
 * DTO para la generacion de codigo QR de un carnet
 */
export class GenerateQrDto {
  @ApiPropertyOptional({
    description: 'Tamano del codigo QR en pixeles (default: 300)',
    example: 300,
    minimum: 100,
    maximum: 1000,
  })
  @IsInt()
  @Min(100, { message: 'El tamano minimo es 100 pixeles' })
  @Max(1000, { message: 'El tamano maximo es 1000 pixeles' })
  @IsOptional()
  @Type(() => Number)
  size?: number = 300;

  @ApiPropertyOptional({
    description: 'Formato de respuesta (url o base64)',
    example: 'url',
    default: 'url',
  })
  @IsString()
  @IsOptional()
  format?: 'url' | 'base64' = 'url';
}

/**
 * DTO para renovar un carnet
 */
export class RenewIdCardDto {
  @ApiProperty({
    description: 'Nueva fecha de vencimiento en formato ISO',
    example: '2026-01-15',
  })
  @IsString()
  fechaVencimiento: string;

  @ApiPropertyOptional({
    description: 'Nueva foto del titular (URL)',
    example: 'https://storage.example.com/photos/user123-new.jpg',
  })
  @IsString()
  @IsOptional()
  nuevaFoto?: string;

  @ApiPropertyOptional({
    description: 'Motivo de la renovacion',
    example: 'Renovacion anual',
  })
  @IsString()
  @IsOptional()
  motivo?: string;
}

/**
 * DTO para bloquear/desbloquear un carnet
 */
export class BlockIdCardDto {
  @ApiProperty({
    description: 'Motivo del bloqueo',
    example: 'Carnet reportado como perdido',
  })
  @IsString()
  motivo: string;
}
