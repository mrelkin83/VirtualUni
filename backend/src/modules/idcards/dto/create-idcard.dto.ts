import {
  IsString,
  IsEnum,
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsUrl,
  MinLength,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserCardType, CardStatus } from '@prisma/client';

/**
 * DTO para la creacion de un nuevo carnet de identificacion
 * Incluye validaciones robustas para todos los campos requeridos
 */
export class CreateIdCardDto {
  @ApiProperty({
    description: 'ID del usuario asociado al carnet (Student, Teacher, etc.)',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsString()
  @IsNotEmpty({ message: 'El ID del usuario es requerido' })
  usuarioId: string;

  @ApiProperty({
    description: 'Nombre completo del titular del carnet',
    example: 'Maria Elena Rodriguez Perez',
  })
  @IsString()
  @IsNotEmpty({ message: 'El nombre es requerido' })
  @MinLength(3, { message: 'El nombre debe tener al menos 3 caracteres' })
  @MaxLength(200, { message: 'El nombre no puede exceder 200 caracteres' })
  nombre: string;

  @ApiProperty({
    description: 'Numero de identificacion del titular',
    example: '1234567890',
  })
  @IsString()
  @IsNotEmpty({ message: 'La identificacion es requerida' })
  @MinLength(5, { message: 'La identificacion debe tener al menos 5 caracteres' })
  @MaxLength(50, { message: 'La identificacion no puede exceder 50 caracteres' })
  identificacion: string;

  @ApiProperty({
    description: 'Tipo de usuario del carnet',
    enum: UserCardType,
    example: UserCardType.ESTUDIANTE,
  })
  @IsEnum(UserCardType, {
    message: `El tipo de usuario debe ser uno de: ${Object.values(UserCardType).join(', ')}`,
  })
  @IsNotEmpty({ message: 'El tipo de usuario es requerido' })
  tipoUsuario: UserCardType;

  @ApiProperty({
    description: 'Fecha de emision del carnet en formato ISO',
    example: '2024-01-15',
  })
  @IsDateString({}, { message: 'La fecha de emision debe ser una fecha valida en formato ISO' })
  @IsNotEmpty({ message: 'La fecha de emision es requerida' })
  fechaEmision: string;

  @ApiProperty({
    description: 'Fecha de vencimiento del carnet en formato ISO',
    example: '2025-01-15',
  })
  @IsDateString({}, { message: 'La fecha de vencimiento debe ser una fecha valida en formato ISO' })
  @IsNotEmpty({ message: 'La fecha de vencimiento es requerida' })
  fechaVencimiento: string;

  @ApiProperty({
    description: 'URL de la foto del titular',
    example: 'https://storage.example.com/photos/user123.jpg',
  })
  @IsUrl({}, { message: 'La foto debe ser una URL valida' })
  @IsNotEmpty({ message: 'La foto es requerida' })
  fotoUrl: string;

  @ApiPropertyOptional({
    description: 'Estado inicial del carnet (default: ACTIVO)',
    enum: CardStatus,
    example: CardStatus.ACTIVO,
  })
  @IsEnum(CardStatus, {
    message: `El estado debe ser uno de: ${Object.values(CardStatus).join(', ')}`,
  })
  @IsOptional()
  estado?: CardStatus = CardStatus.ACTIVO;
}
