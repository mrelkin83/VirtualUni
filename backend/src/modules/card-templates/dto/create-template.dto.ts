import {
  IsString,
  IsNotEmpty,
  IsArray,
  IsOptional,
  IsBoolean,
  IsNumber,
  IsEnum,
  IsObject,
  MinLength,
  MaxLength,
  Min,
  Max,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserCardType } from '@prisma/client';

/**
 * Configuración del layout de la plantilla
 * Define la posición de los elementos en el carnet
 */
export class LayoutConfigDto {
  @ApiPropertyOptional({ description: 'Configuración del área de foto' })
  @IsOptional()
  @IsObject()
  photo?: {
    x: number;
    y: number;
    width: number;
    height: number;
    borderRadius?: number;
  };

  @ApiPropertyOptional({ description: 'Configuración del área de QR' })
  @IsOptional()
  @IsObject()
  qr?: {
    x: number;
    y: number;
    size: number;
  };

  @ApiPropertyOptional({ description: 'Configuración del área de logo' })
  @IsOptional()
  @IsObject()
  logo?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };

  @ApiPropertyOptional({ description: 'Elementos de texto personalizados' })
  @IsOptional()
  @IsArray()
  textElements?: Array<{
    key: string;
    x: number;
    y: number;
    fontSize: number;
    fontWeight?: string;
    color?: string;
    align?: string;
  }>;
}

/**
 * Configuración de campos dinámicos
 */
export class FieldConfigDto {
  @ApiProperty({ description: 'Campos a mostrar en el carnet' })
  @IsArray()
  fields: Array<{
    key: string;
    label: string;
    visible: boolean;
    required: boolean;
    format?: string;
  }>;
}

/**
 * DTO para crear una plantilla de carnet
 */
export class CreateCardTemplateDto {
  @ApiProperty({
    description: 'Nombre de la plantilla',
    example: 'Plantilla Estudiantes 2024',
  })
  @IsString()
  @IsNotEmpty({ message: 'El nombre es requerido' })
  @MinLength(3, { message: 'El nombre debe tener al menos 3 caracteres' })
  @MaxLength(100, { message: 'El nombre no puede exceder 100 caracteres' })
  nombre: string;

  @ApiPropertyOptional({
    description: 'Descripción de la plantilla',
    example: 'Plantilla oficial para carnets de estudiantes universitarios',
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  descripcion?: string;

  @ApiProperty({
    description: 'Tipos de usuario que pueden usar esta plantilla',
    enum: UserCardType,
    isArray: true,
    example: [UserCardType.ESTUDIANTE],
  })
  @IsArray()
  @IsNotEmpty({ message: 'Debe especificar al menos un tipo de usuario' })
  tiposUsuario: string[];

  @ApiProperty({
    description: 'Configuración del layout (posición de elementos)',
    type: 'object',
  })
  @IsObject()
  @IsNotEmpty({ message: 'La configuración del layout es requerida' })
  layoutConfig: object;

  @ApiProperty({
    description: 'Configuración de campos dinámicos',
    type: 'object',
  })
  @IsObject()
  @IsNotEmpty({ message: 'La configuración de campos es requerida' })
  campos: object;

  @ApiPropertyOptional({
    description: 'Ancho del carnet en milímetros',
    example: 85.6,
    default: 85.6,
  })
  @IsOptional()
  @IsNumber()
  @Min(50)
  @Max(120)
  ancho?: number;

  @ApiPropertyOptional({
    description: 'Alto del carnet en milímetros',
    example: 53.98,
    default: 53.98,
  })
  @IsOptional()
  @IsNumber()
  @Min(30)
  @Max(100)
  alto?: number;

  @ApiPropertyOptional({
    description: 'Orientación del carnet',
    example: 'horizontal',
    enum: ['horizontal', 'vertical'],
  })
  @IsOptional()
  @IsEnum(['horizontal', 'vertical'])
  orientacion?: string;

  @ApiPropertyOptional({
    description: 'Color primario (hexadecimal)',
    example: '#3B82F6',
  })
  @IsOptional()
  @IsString()
  colorPrimario?: string;

  @ApiPropertyOptional({
    description: 'Color secundario (hexadecimal)',
    example: '#1E40AF',
  })
  @IsOptional()
  @IsString()
  colorSecundario?: string;

  @ApiPropertyOptional({
    description: 'Color del texto (hexadecimal)',
    example: '#FFFFFF',
  })
  @IsOptional()
  @IsString()
  colorTexto?: string;

  @ApiPropertyOptional({
    description: 'Fuente principal',
    example: 'Arial',
  })
  @IsOptional()
  @IsString()
  fuentePrincipal?: string;

  @ApiPropertyOptional({
    description: 'Fuente secundaria',
    example: 'Arial',
  })
  @IsOptional()
  @IsString()
  fuenteSecundaria?: string;

  @ApiPropertyOptional({
    description: 'URL del logo institucional',
  })
  @IsOptional()
  @IsString()
  logoUrl?: string;

  @ApiPropertyOptional({
    description: 'URL de imagen de fondo frontal',
  })
  @IsOptional()
  @IsString()
  fondoFrontalUrl?: string;

  @ApiPropertyOptional({
    description: 'URL de imagen de fondo posterior',
  })
  @IsOptional()
  @IsString()
  fondoPosteriorUrl?: string;

  @ApiPropertyOptional({
    description: 'Plantilla activa',
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  esActiva?: boolean;

  @ApiPropertyOptional({
    description: 'Marcar como plantilla predeterminada',
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  esPredeterminada?: boolean;

  @ApiPropertyOptional({
    description: 'Incluir código QR',
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  incluirQR?: boolean;

  @ApiPropertyOptional({
    description: 'Incluir código de barras',
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  incluirCodigoBarras?: boolean;

  @ApiPropertyOptional({
    description: 'Carnet a dobles caras',
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  doblesCara?: boolean;
}
