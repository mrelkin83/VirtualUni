import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsArray,
  IsOptional,
  IsUUID,
  MinLength,
  MaxLength,
  ArrayMinSize,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IssuanceType } from '@prisma/client';

/**
 * DTO de datos básicos de usuario para expedición
 */
export class UserDataDto {
  @ApiProperty({ description: 'ID del usuario' })
  @IsString()
  @IsNotEmpty()
  usuarioId: string;

  @ApiProperty({ description: 'Nombre completo' })
  @IsString()
  @IsNotEmpty()
  nombre: string;

  @ApiProperty({ description: 'Número de identificación' })
  @IsString()
  @IsNotEmpty()
  identificacion: string;

  @ApiProperty({ description: 'Tipo de usuario' })
  @IsString()
  @IsNotEmpty()
  tipoUsuario: string;

  @ApiProperty({ description: 'URL de la foto' })
  @IsString()
  @IsNotEmpty()
  fotoUrl: string;
}

/**
 * DTO para crear una expedición de carnets
 */
export class CreateCardIssuanceDto {
  @ApiPropertyOptional({
    description: 'ID de la plantilla a usar (opcional, usa la predeterminada si no se especifica)',
  })
  @IsOptional()
  @IsUUID()
  templateId?: string;

  @ApiProperty({
    description: 'Tipo de expedición',
    enum: IssuanceType,
    example: IssuanceType.NUEVA_EMISION,
  })
  @IsEnum(IssuanceType, {
    message: `El tipo de expedición debe ser uno de: ${Object.values(IssuanceType).join(', ')}`,
  })
  @IsNotEmpty()
  tipoExpedicion: IssuanceType;

  @ApiProperty({
    description: 'Datos de los usuarios para los que se expedirán carnets',
    type: [UserDataDto],
  })
  @IsArray()
  @ArrayMinSize(1, { message: 'Debe proporcionar al menos un usuario' })
  usuarios: UserDataDto[];

  @ApiPropertyOptional({
    description: 'Motivo de la expedición',
    example: 'Expedición de carnets para nuevos estudiantes 2024-1',
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  motivo?: string;

  @ApiPropertyOptional({
    description: 'Observaciones adicionales',
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  observaciones?: string;
}

/**
 * DTO para expedición masiva desde archivo
 */
export class BulkIssuanceDto {
  @ApiPropertyOptional({
    description: 'ID de la plantilla a usar',
  })
  @IsOptional()
  @IsUUID()
  templateId?: string;

  @ApiProperty({
    description: 'Tipo de expedición',
    enum: IssuanceType,
    example: IssuanceType.MASIVA,
  })
  @IsEnum(IssuanceType)
  @IsNotEmpty()
  tipoExpedicion: IssuanceType;

  @ApiProperty({
    description: 'Datos en formato JSON de usuarios',
  })
  @IsArray()
  @ArrayMinSize(1)
  usuarios: UserDataDto[];

  @ApiPropertyOptional({
    description: 'Motivo de la expedición masiva',
  })
  @IsOptional()
  @IsString()
  motivo?: string;
}
