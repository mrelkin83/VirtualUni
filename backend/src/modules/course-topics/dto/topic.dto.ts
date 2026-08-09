import { IsString, IsOptional, IsInt, IsArray, IsBoolean, IsUUID, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * Temas (módulos) de un curso y sus bloques de contenido. El modelo existía en
 * el esquema y el panel del docente tenía el editor completo, pero no había
 * controlador: crear, editar o borrar un módulo o un tema solo movía datos en
 * memoria y se perdía al recargar.
 */
export class CrearTemaDto {
  @ApiProperty()
  @IsUUID()
  courseId: string;

  @ApiProperty()
  @IsString()
  title: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ required: false })
  @IsInt()
  @Min(0)
  @IsOptional()
  orderIndex?: number;
}

export class ActualizarTemaDto {
  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ required: false })
  @IsInt()
  @Min(0)
  @IsOptional()
  orderIndex?: number;

  @ApiProperty({ required: false })
  @IsBoolean()
  @IsOptional()
  completed?: boolean;
}

export class CrearBloqueDto {
  @ApiProperty()
  @IsString()
  title: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  content?: string;

  @ApiProperty({ required: false, type: [String] })
  @IsArray()
  @IsOptional()
  objectives?: string[];

  @ApiProperty({ required: false, type: [String] })
  @IsArray()
  @IsOptional()
  keyIdeas?: string[];

  @ApiProperty({ required: false })
  @IsInt()
  @Min(0)
  @IsOptional()
  orderIndex?: number;
}

export class ActualizarBloqueDto extends CrearBloqueDto {
  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  declare title: string;
}
