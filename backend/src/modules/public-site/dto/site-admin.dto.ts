import {
  ArrayMaxSize,
  IsArray,
  IsBoolean,
  IsEmail,
  IsEnum,
  IsInt,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  IsUrl,
  Matches,
  Max,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { InstitutionType, SiteMode } from '@prisma/client';

/**
 * Los campos Json de TenantSite entran SOLO por estos DTOs anidados: el
 * ValidationPipe global (whitelist + forbidNonWhitelisted) tumba cualquier
 * cosa fuera de lo declarado. Nunca HTML libre: todo se escapa al renderizar.
 */

class CtaDto {
  @IsString() @MaxLength(40) label: string;
  @IsString() @MaxLength(300) href: string;
}

export class HeroSlideDto {
  @IsString() @MaxLength(120) title: string;
  @IsOptional() @IsString() @MaxLength(220) subtitle?: string;
  @IsOptional() @IsString() @MaxLength(500) imageUrl?: string | null;
  @IsOptional() @IsNumber() @Min(0) @Max(0.85) overlay?: number;
  @IsOptional() @ValidateNested() @Type(() => CtaDto) ctaPrimary?: CtaDto;
  @IsOptional() @ValidateNested() @Type(() => CtaDto) ctaSecondary?: CtaDto;
}

class SeccionesDto {
  @IsArray() @IsString({ each: true }) order: string[];
  @IsArray() @IsString({ each: true }) hidden: string[];
}

class BeneficioDto {
  @IsOptional() @IsString() @MaxLength(30) icon?: string;
  @IsString() @MaxLength(60) title: string;
  @IsString() @MaxLength(220) text: string;
}

class CifraDto {
  @IsString() @MaxLength(12) value: string;
  @IsString() @MaxLength(40) label: string;
}

class RedesDto {
  @IsOptional() @IsUrl({ require_protocol: true }) @MaxLength(300) facebook?: string;
  @IsOptional() @IsUrl({ require_protocol: true }) @MaxLength(300) instagram?: string;
  @IsOptional() @IsUrl({ require_protocol: true }) @MaxLength(300) youtube?: string;
  @IsOptional() @IsUrl({ require_protocol: true }) @MaxLength(300) tiktok?: string;
  @IsOptional() @IsUrl({ require_protocol: true }) @MaxLength(300) x?: string;
  @IsOptional() @IsUrl({ require_protocol: true }) @MaxLength(300) linkedin?: string;
}

class ContactoDto {
  @IsOptional() @IsString() @MaxLength(160) direccion?: string;
  @IsOptional() @IsString() @MaxLength(40) telefono?: string;
  @IsOptional() @IsEmail() @MaxLength(160) email?: string;
  @IsOptional() @IsString() @MaxLength(120) horario?: string;
  @IsOptional() @IsUrl({ require_protocol: true }) @MaxLength(500) mapa?: string;
  @IsOptional() @ValidateNested() @Type(() => RedesDto) redes?: RedesDto;
}

class AnuncioDto {
  @IsString() @MaxLength(140) text!: string;
  /** Ruta propia («/admisiones») o URL completa. */
  @IsOptional() @IsString() @MaxLength(300) @Matches(/^(\/|https?:\/\/)/) link?: string;
  @IsOptional() @IsBoolean() active?: boolean;
}

class AnaliticaDto {
  @IsOptional() @Matches(/^G-[A-Z0-9]{4,20}$/) ga4?: string;
  @IsOptional() @Matches(/^GTM-[A-Z0-9]{4,20}$/) gtm?: string;
  @IsOptional() @Matches(/^\d{5,20}$/) metaPixel?: string;
  @IsOptional() @Matches(/^AW-[A-Z0-9/_-]{4,40}$/i) adsConversion?: string;
}

export class ActualizarSitioDto {
  @IsOptional() @IsEnum(InstitutionType) institutionType?: InstitutionType;
  @IsOptional() @IsBoolean() published?: boolean;
  @IsOptional() @IsEnum(SiteMode) siteMode?: SiteMode;
  @IsOptional() @IsUrl({ require_protocol: true }) @MaxLength(300) externalWebsiteUrl?: string;

  @IsOptional() @IsArray() @ArrayMaxSize(3) @ValidateNested({ each: true }) @Type(() => HeroSlideDto)
  heroSlides?: HeroSlideDto[];

  @IsOptional() @IsBoolean() showHeroSearch?: boolean;
  @IsOptional() @ValidateNested() @Type(() => SeccionesDto) sections?: SeccionesDto;

  @IsOptional() @IsArray() @ArrayMaxSize(6) @ValidateNested({ each: true }) @Type(() => BeneficioDto)
  benefits?: BeneficioDto[];

  @IsOptional() @IsArray() @ArrayMaxSize(6) @ValidateNested({ each: true }) @Type(() => CifraDto)
  stats?: CifraDto[];

  @IsOptional() @IsArray() @IsString({ each: true }) @ArrayMaxSize(12)
  featuredProgramIds?: string[];

  /** { pregrado: {label?, hidden?}, … } — se sanea en el servicio a las categorías conocidas */
  @IsOptional() @IsObject() levelLabels?: Record<string, { label?: string; hidden?: boolean }>;

  @IsOptional() @ValidateNested() @Type(() => ContactoDto) contact?: ContactoDto;
  @IsOptional() @Matches(/^\d{10,15}$/) whatsappNumber?: string;
  @IsOptional() @IsString() @MaxLength(300) whatsappMessage?: string;
  @IsOptional() @IsString() @MaxLength(70) seoTitle?: string;
  @IsOptional() @IsString() @MaxLength(170) seoDescription?: string;
  @IsOptional() @ValidateNested() @Type(() => AnaliticaDto) analytics?: AnaliticaDto;
  @IsOptional() @IsString() @MaxLength(5000) paymentInstructions?: string;
  @IsOptional() @IsString() @MaxLength(30000) privacyPolicy?: string;
  @IsOptional() @IsUrl({ require_protocol: true }) @MaxLength(300) privacyPolicyUrl?: string;
  @IsOptional() @IsString() @MaxLength(10) privacyVersion?: string;
  @IsOptional() @IsString() @MaxLength(120) dataControllerName?: string;
  @IsOptional() @ValidateNested() @Type(() => AnuncioDto) announcement?: AnuncioDto;
}

/** Página institucional libre (Conócenos, Bienestar, Calidad…). */
export class GuardarPaginaDto {
  @IsString() @Matches(/^[a-z0-9]+(-[a-z0-9]+)*$/) @MaxLength(80) slug!: string;
  @IsString() @MaxLength(120) title!: string;
  @IsOptional() @IsString() @MaxLength(40) menuGroup?: string;
  @IsOptional() @IsInt() @Min(0) @Max(99) order?: number;
  @IsOptional() @IsString() @MaxLength(200) summary?: string;
  @IsString() @MaxLength(30000) content!: string;
  @IsOptional() @IsUrl({ require_protocol: true }) @MaxLength(500) imageUrl?: string;
  @IsOptional() @IsBoolean() isPublished?: boolean;
}
