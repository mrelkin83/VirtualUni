import { IsString, IsOptional, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';

export class CreatePostDto {
  @ApiProperty({ description: 'Contenido de la publicacion' })
  @IsString()
  @MinLength(1, { message: 'La publicacion no puede estar vacia' })
  contenido: string;

  @ApiPropertyOptional({ description: 'URL de una imagen adjunta' })
  @IsString()
  @IsOptional()
  imagenUrl?: string;

  @ApiPropertyOptional({ description: 'Categoria', default: 'general' })
  @IsString()
  @IsOptional()
  categoria?: string;
}

export class UpdatePostDto extends PartialType(CreatePostDto) {}

export class CreateCommentDto {
  @ApiProperty({ description: 'Contenido del comentario' })
  @IsString()
  @MinLength(1, { message: 'El comentario no puede estar vacio' })
  contenido: string;
}

export class QueryPostsDto {
  @ApiPropertyOptional({ description: 'Filtrar por categoria' })
  @IsString()
  @IsOptional()
  categoria?: string;

  @ApiPropertyOptional({ description: 'Buscar en el contenido' })
  @IsString()
  @IsOptional()
  search?: string;
}
