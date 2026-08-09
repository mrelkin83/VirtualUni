import { IsString, IsOptional, IsUUID, IsBoolean, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';

export class CreateTopicDto {
  @ApiPropertyOptional({ description: 'Curso al que pertenece el tema' })
  @IsUUID('4', { message: 'El curso debe ser un UUID valido' })
  @IsOptional()
  courseId?: string;

  @ApiProperty({ description: 'Titulo del tema' })
  @IsString()
  @MinLength(3, { message: 'El titulo debe tener al menos 3 caracteres' })
  titulo: string;

  @ApiProperty({ description: 'Contenido del tema' })
  @IsString()
  @MinLength(5, { message: 'El contenido debe tener al menos 5 caracteres' })
  contenido: string;

  @ApiPropertyOptional({ description: 'Categoria', default: 'general' })
  @IsString()
  @IsOptional()
  categoria?: string;
}

export class UpdateTopicDto extends PartialType(CreateTopicDto) {
  @ApiPropertyOptional({ description: 'Fijar el tema en la parte superior' })
  @IsBoolean()
  @IsOptional()
  fijado?: boolean;

  @ApiPropertyOptional({ description: 'Cerrar el tema a nuevas respuestas' })
  @IsBoolean()
  @IsOptional()
  cerrado?: boolean;
}

export class QueryTopicsDto {
  @ApiPropertyOptional({ description: 'Filtrar por curso' })
  @IsUUID('4', { message: 'El curso debe ser un UUID valido' })
  @IsOptional()
  courseId?: string;

  @ApiPropertyOptional({ description: 'Filtrar por categoria' })
  @IsString()
  @IsOptional()
  categoria?: string;

  @ApiPropertyOptional({ description: 'Buscar por titulo o contenido' })
  @IsString()
  @IsOptional()
  search?: string;
}

export class CreateReplyDto {
  @ApiProperty({ description: 'Contenido de la respuesta' })
  @IsString()
  @MinLength(1, { message: 'La respuesta no puede estar vacia' })
  contenido: string;
}

export class UpdateReplyDto {
  @ApiPropertyOptional({ description: 'Contenido de la respuesta' })
  @IsString()
  @IsOptional()
  contenido?: string;

  @ApiPropertyOptional({ description: 'Marcar la respuesta como solucion' })
  @IsBoolean()
  @IsOptional()
  esSolucion?: boolean;
}
