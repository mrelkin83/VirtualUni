import {
  ArrayMaxSize,
  IsArray,
  IsBoolean,
  IsDateString,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

class FaqDto {
  @IsString() @MaxLength(200) q: string;
  @IsString() @MaxLength(1000) a: string;
}

/** Campos públicos del programa para el sitio web (pestaña "Publicación"). */
export class PublicacionProgramaDto {
  @ApiProperty({ required: false, example: 'tecnologo-en-desarrollo-de-software' })
  @IsOptional()
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message: 'El slug solo admite minúsculas, números y guiones',
  })
  @MaxLength(90)
  slug?: string;

  @IsOptional() @IsBoolean() isPublished?: boolean;
  @IsOptional() @IsString() @MaxLength(200) shortDescription?: string;
  @IsOptional() @IsString() @MaxLength(10000) publicDescription?: string;
  @IsOptional() @IsString() @MaxLength(5000) graduateProfile?: string;
  @IsOptional() @IsString() @MaxLength(5000) occupationalProfile?: string;
  @IsOptional() @IsString() @MaxLength(500) imageUrl?: string;

  /** Fecha hasta la que se muestra la etiqueta NUEVO; null o '' la apaga. */
  @IsOptional() @IsDateString() isNewUntil?: string | null;

  @IsOptional() @IsString() @MaxLength(80) area?: string;
  @IsOptional() @IsString() @MaxLength(120) schedule?: string;
  @IsOptional() @IsString() @MaxLength(80) tuitionDisplay?: string;

  @IsOptional() @IsArray() @ArrayMaxSize(10) @ValidateNested({ each: true }) @Type(() => FaqDto)
  faq?: FaqDto[];
}
