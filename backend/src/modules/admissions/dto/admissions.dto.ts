import {
  IsBoolean,
  IsDateString,
  IsEmail,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  Max,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

/**
 * Payloads PÚBLICOS de inscripción. El ValidationPipe global (whitelist +
 * forbidNonWhitelisted) exige declarar hasta el honeypot: "web" debe venir
 * vacío y "_t" trae la marca de tiempo del formulario (§8).
 */

export class AcudienteDto {
  @IsString() @IsNotEmpty() @MaxLength(120) nombre: string;
  @IsString() @Matches(/^[A-Za-z0-9-]{4,20}$/) documento: string;
  @IsString() @MaxLength(40) parentesco: string;
  @IsString() @Matches(/^[\d+\s()-]{7,20}$/) telefono: string;
  @IsOptional() @IsEmail() @MaxLength(160) email?: string;
}

class Antispam {
  /** Honeypot: un humano nunca lo llena. */
  @IsOptional() @IsString() @MaxLength(100) web?: string;
  /** Momento en que se abrió el formulario (ms epoch). */
  @IsOptional() @IsString() @MaxLength(20) _t?: string;
}

export class CrearBorradorDto extends Antispam {
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

  /** Colegio: grado al que aspira (0 = transición). */
  @IsOptional() @IsInt() @Min(0) @Max(13) targetLevel?: number;

  @IsOptional() @ValidateNested() @Type(() => AcudienteDto) guardian?: AcudienteDto;
  @IsOptional() @IsBoolean() guardianConsent?: boolean;
  @IsOptional() @IsBoolean() submittedByGuardian?: boolean;
}

export class ActualizarBorradorDto {
  @IsOptional() @IsDateString() birthDate?: string;
  @IsOptional() @IsString() @MaxLength(80) city?: string;
  @IsOptional() @IsString() @MaxLength(60) previousEducation?: string;
  @IsOptional() @ValidateNested() @Type(() => AcudienteDto) guardian?: AcudienteDto;
  @IsOptional() @IsBoolean() guardianConsent?: boolean;
}

export class EnviarDto {
  /** Casilla de autorización de datos: NUNCA marcada por defecto. */
  @IsBoolean() consent: boolean;
}

export class SolicitarEnlaceDto extends Antispam {
  @Matches(/^[A-Za-z0-9-]{4,20}$/) documentNumber: string;
  @IsEmail() @MaxLength(160) email: string;
}

export class LeadDto extends Antispam {
  @IsString() @IsNotEmpty() @MaxLength(120) nombre: string;
  @Matches(/^[\d+\s()-]{7,20}$/) telefono: string;
  @IsEmail() @MaxLength(160) email: string;
  @IsOptional() @IsString() @MaxLength(500) mensaje?: string;
  /** La casilla de la política: el servicio exige que venga. */
  @IsOptional() @IsString() @MaxLength(10) acepta?: string;
}

export class RevisarDocumentoDto {
  @IsIn(['APROBADO', 'RECHAZADO']) status: string;
  @IsOptional() @IsString() @MaxLength(500) reviewNote?: string;
}

export class PedirCorreccionDto {
  @IsString() @IsNotEmpty() @MaxLength(1000) nota: string;
}
