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

export class ConfirmarPagoDto {
  @IsOptional() @IsString() @MaxLength(80) ref?: string;
}

export class DecisionDto {
  @IsOptional() @IsString() @MaxLength(1000) nota?: string;
}

export class NoAdmitirDto {
  @IsString() @IsNotEmpty() @MaxLength(1000) nota: string;
}

// ---------------------------------------------- CRUD de convocatorias (§5)

class DocRequeridoDto {
  @IsString() @IsNotEmpty() @MaxLength(120) name: string;
  @IsOptional() @IsBoolean() required?: boolean;
}

class GradoCupoDto {
  @IsInt() @Min(0) @Max(13) level: number;
  @IsString() @MaxLength(30) label: string;
  @IsOptional() @IsInt() @Min(1) @Max(2000) capacity?: number;
}

export class CrearConvocatoriaDto {
  @IsString() @IsNotEmpty() programId: string;
  @IsString() @IsNotEmpty() academicPeriodId: string;
  @IsString() @IsNotEmpty() studyPlanId: string;
  @IsString() @IsNotEmpty() @MaxLength(160) name: string;
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/) @MaxLength(120) slug: string;
  @IsDateString() opensAt: string;
  @IsOptional() @IsDateString() closesAt?: string | null;
  @IsOptional() @IsBoolean() rolling?: boolean;
  @IsOptional() @IsDateString() startsAt?: string | null;
  @IsOptional() @IsInt() @Min(1) @Max(100000) capacity?: number | null;
  @IsOptional() @IsString() @MaxLength(120) schedule?: string | null;
  @IsOptional() @IsIn(['PRESENCIAL', 'VIRTUAL', 'HIBRIDA', 'DISTANCIA']) modality?: string | null;
  @IsOptional() @IsInt() @Min(0) @Max(100_000_000) applicationFee?: number;
  @IsOptional() @IsInt() @Min(3) @Max(99) minAge?: number | null;
  @IsOptional() @IsInt() @Min(3) @Max(120) maxAge?: number | null;
  @IsOptional() @IsString() @MaxLength(60) minEducation?: string | null;
  @IsOptional() @ValidateNested({ each: true }) @Type(() => GradoCupoDto) targetLevels?: GradoCupoDto[] | null;
  @IsOptional() @ValidateNested({ each: true }) @Type(() => DocRequeridoDto) documentos?: DocRequeridoDto[];
}

export class ActualizarConvocatoriaDto extends CrearConvocatoriaDto {
  @IsOptional() @IsString() declare programId: string;
  @IsOptional() @IsString() declare academicPeriodId: string;
  @IsOptional() @IsString() declare studyPlanId: string;
  @IsOptional() @IsString() @MaxLength(160) declare name: string;
  @IsOptional() @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/) declare slug: string;
  @IsOptional() @IsDateString() declare opensAt: string;
  @IsOptional() @IsIn(['BORRADOR', 'ABIERTA', 'CERRADA']) status?: string;
}
