import {
  IsString,
  IsEnum,
  IsDateString,
  IsOptional,
  IsUrl,
  MinLength,
  MaxLength,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { UserCardType, CardStatus } from '@prisma/client';

/**
 * DTO para la actualizacion de un carnet de identificacion
 * Todos los campos son opcionales para actualizacion parcial
 */
export class UpdateIdCardDto {
  @ApiPropertyOptional({
    description: 'Nombre completo del titular del carnet',
    example: 'Maria Elena Rodriguez Perez',
  })
  @IsString()
  @MinLength(3, { message: 'El nombre debe tener al menos 3 caracteres' })
  @MaxLength(200, { message: 'El nombre no puede exceder 200 caracteres' })
  @IsOptional()
  nombre?: string;

  @ApiPropertyOptional({
    description: 'Numero de identificacion del titular',
    example: '1234567890',
  })
  @IsString()
  @MinLength(5, { message: 'La identificacion debe tener al menos 5 caracteres' })
  @MaxLength(50, { message: 'La identificacion no puede exceder 50 caracteres' })
  @IsOptional()
  identificacion?: string;

  @ApiPropertyOptional({
    description: 'Tipo de usuario del carnet',
    enum: UserCardType,
    example: UserCardType.ESTUDIANTE,
  })
  @IsEnum(UserCardType, {
    message: `El tipo de usuario debe ser uno de: ${Object.values(UserCardType).join(', ')}`,
  })
  @IsOptional()
  tipoUsuario?: UserCardType;

  @ApiPropertyOptional({
    description: 'Fecha de emision del carnet en formato ISO',
    example: '2024-01-15',
  })
  @IsDateString({}, { message: 'La fecha de emision debe ser una fecha valida en formato ISO' })
  @IsOptional()
  fechaEmision?: string;

  @ApiPropertyOptional({
    description: 'Fecha de vencimiento del carnet en formato ISO',
    example: '2025-01-15',
  })
  @IsDateString({}, { message: 'La fecha de vencimiento debe ser una fecha valida en formato ISO' })
  @IsOptional()
  fechaVencimiento?: string;

  @ApiPropertyOptional({
    description: 'URL de la foto del titular',
    example: 'https://storage.example.com/photos/user123.jpg',
  })
  @IsUrl({}, { message: 'La foto debe ser una URL valida' })
  @IsOptional()
  fotoUrl?: string;

  @ApiPropertyOptional({
    description: 'Estado del carnet',
    enum: CardStatus,
    example: CardStatus.ACTIVO,
  })
  @IsEnum(CardStatus, {
    message: `El estado debe ser uno de: ${Object.values(CardStatus).join(', ')}`,
  })
  @IsOptional()
  estado?: CardStatus;
}
