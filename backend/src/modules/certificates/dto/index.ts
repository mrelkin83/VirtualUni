import { IsString, IsOptional, IsEnum, IsNumber, IsUUID, MinLength, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CertificateStatus } from '@prisma/client';

export class CreateCertificateRequestDto {
  @ApiProperty({ description: 'Tipo de certificado', example: 'Certificado de notas' })
  @IsString()
  @MinLength(3, { message: 'El tipo debe tener al menos 3 caracteres' })
  tipo: string;

  @ApiPropertyOptional({ description: 'Motivo de la solicitud' })
  @IsString()
  @IsOptional()
  motivo?: string;

  @ApiPropertyOptional({ description: 'Costo del certificado', default: 0 })
  @Type(() => Number)
  @IsNumber({}, { message: 'El costo debe ser un numero' })
  @Min(0, { message: 'El costo no puede ser negativo' })
  @IsOptional()
  costo?: number;
}

export class UpdateCertificateRequestDto {
  @ApiPropertyOptional({ description: 'Estado de la solicitud', enum: CertificateStatus })
  @IsEnum(CertificateStatus, { message: 'El estado de la solicitud no es valido' })
  @IsOptional()
  estado?: CertificateStatus;

  @ApiPropertyOptional({ description: 'URL del archivo emitido' })
  @IsString()
  @IsOptional()
  archivoUrl?: string;

  @ApiPropertyOptional({ description: 'Observaciones del area administrativa' })
  @IsString()
  @IsOptional()
  observaciones?: string;
}

export class QueryCertificatesDto {
  @ApiPropertyOptional({ description: 'Filtrar por estado', enum: CertificateStatus })
  @IsEnum(CertificateStatus, { message: 'El estado de la solicitud no es valido' })
  @IsOptional()
  estado?: CertificateStatus;

  @ApiPropertyOptional({ description: 'Filtrar por estudiante' })
  @IsUUID('4', { message: 'El estudiante debe ser un UUID valido' })
  @IsOptional()
  studentId?: string;

  @ApiPropertyOptional({ description: 'Filtrar por tipo' })
  @IsString()
  @IsOptional()
  tipo?: string;
}
