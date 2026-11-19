import {
  IsBoolean,
  IsDateString,
  IsDefined,
  IsEmail,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  Matches,
  Max,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { AcudienteDto } from '../../admissions/dto/admissions.dto';

/**
 * La institución recoge el consentimiento EN SU formulario y responde por él:
 * la API exige la constancia completa (§13.3).
 */
export class ConsentimientoDto {
  @ApiProperty({ example: '2027-01-10T14:30:00Z' })
  @IsDateString() acceptedAt: string;
  @ApiProperty({ example: '190.0.0.10' })
  @IsString() @MaxLength(45) ip: string;
  @ApiProperty({ example: '2' })
  @IsString() @MaxLength(20) policyVersion: string;
}

export class CrearSolicitudApiDto {
  @ApiProperty({ example: 'auxiliar-contable-permanente' })
  @IsString() @IsNotEmpty() @MaxLength(120) callSlug: string;

  @IsIn(['CC', 'TI', 'CE', 'RC', 'PASAPORTE', 'PPT']) documentType: string;
  @Matches(/^[A-Za-z0-9-]{4,20}$/) documentNumber: string;
  @IsString() @IsNotEmpty() @MaxLength(80) firstName: string;
  @IsString() @IsNotEmpty() @MaxLength(80) lastName: string;
  @IsEmail() @MaxLength(160) email: string;
  @Matches(/^[\d+\s()-]{7,20}$/) phone: string;

  @IsOptional() @IsDateString() birthDate?: string;
  @IsOptional() @IsString() @MaxLength(80) city?: string;
  @IsOptional() @IsString() @MaxLength(60) previousEducation?: string;
  @IsOptional() @IsInt() @Min(0) @Max(13) targetLevel?: number;
  @IsOptional() @ValidateNested() @Type(() => AcudienteDto) guardian?: AcudienteDto;
  @IsOptional() @IsBoolean() guardianConsent?: boolean;

  @IsDefined({ message: 'consent es obligatorio: la institución responde por la autorización de datos' })
  @ValidateNested() @Type(() => ConsentimientoDto) consent: ConsentimientoDto;

  /** Id del CRM de la institución, para que sincronicen sin tabla aparte. */
  @IsOptional() @IsString() @MaxLength(80) externalId?: string;
  @IsOptional() @IsObject() utm?: Record<string, string>;
}

export class CrearLeadApiDto {
  @IsString() @IsNotEmpty() @MaxLength(120) nombre: string;
  @Matches(/^[\d+\s()-]{7,20}$/) telefono: string;
  @IsEmail() @MaxLength(160) email: string;
  @IsOptional() @IsString() @MaxLength(500) mensaje?: string;
  @IsDefined({ message: 'consent es obligatorio: la institución responde por la autorización de datos' })
  @ValidateNested() @Type(() => ConsentimientoDto) consent: ConsentimientoDto;
  @IsOptional() @IsObject() utm?: Record<string, string>;
}

// --------------------------------------------- administración de integraciones

export class CrearLlaveDto {
  @IsString() @IsNotEmpty() @MaxLength(80) name: string;
  @IsIn(['PUBLISHABLE', 'SECRET']) type: 'PUBLISHABLE' | 'SECRET';
  @IsOptional() @IsBoolean() testMode?: boolean;
  @IsOptional() @IsString({ each: true }) scopes?: string[];
  @IsOptional() @Matches(/^https?:\/\/[^\s]+$/, { each: true }) allowedOrigins?: string[];
}

export class CrearWebhookDto {
  @Matches(/^https:\/\/[^\s]+$|^http:\/\/localhost(:\d+)?\/[^\s]*$/, {
    message: 'La URL del webhook debe ser HTTPS (o localhost en desarrollo)',
  })
  @MaxLength(500)
  url: string;

  @IsString({ each: true }) events: string[];
  @IsOptional() @IsBoolean() active?: boolean;
}

export class OrigenesEmbedDto {
  @Matches(/^https?:\/\/[^\s/]+$/, { each: true, message: 'Cada origen debe ser https://dominio (sin ruta)' })
  origins: string[];
}
