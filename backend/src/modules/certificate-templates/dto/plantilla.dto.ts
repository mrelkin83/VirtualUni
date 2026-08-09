import { IsString, IsOptional, IsIn, IsArray, IsObject } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CrearPlantillaDto {
  @ApiProperty()
  @IsString()
  nombre: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  descripcion?: string;

  @ApiProperty({ required: false, enum: ['borrador', 'publicado'] })
  @IsIn(['borrador', 'publicado'])
  @IsOptional()
  estado?: string;

  /** Bloques del compositor: texto, campo_dinamico, firma, qr_code. */
  @ApiProperty({ required: false, type: [Object] })
  @IsArray()
  @IsOptional()
  componentes?: unknown[];

  /** Tamaño, orientación, márgenes y fondo. */
  @ApiProperty({ required: false, type: Object })
  @IsObject()
  @IsOptional()
  configuracion?: Record<string, unknown>;
}

export class ActualizarPlantillaDto extends CrearPlantillaDto {
  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  declare nombre: string;
}
