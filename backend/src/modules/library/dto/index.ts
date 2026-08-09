import {
  IsString,
  IsOptional,
  IsInt,
  IsUUID,
  IsDateString,
  IsEnum,
  MinLength,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { LoanStatus } from '@prisma/client';

export class CreateBookDto {
  @ApiProperty({ description: 'Titulo del libro' })
  @IsString()
  @MinLength(2, { message: 'El titulo debe tener al menos 2 caracteres' })
  titulo: string;

  @ApiProperty({ description: 'Autor del libro' })
  @IsString()
  @MinLength(2, { message: 'El autor debe tener al menos 2 caracteres' })
  autor: string;

  @ApiPropertyOptional({ description: 'ISBN' })
  @IsString()
  @IsOptional()
  isbn?: string;

  @ApiProperty({ description: 'Categoria', example: 'Ingenieria' })
  @IsString()
  @MinLength(2, { message: 'La categoria debe tener al menos 2 caracteres' })
  categoria: string;

  @ApiPropertyOptional({ description: 'Editorial' })
  @IsString()
  @IsOptional()
  editorial?: string;

  @ApiPropertyOptional({ description: 'Anio de publicacion' })
  @Type(() => Number)
  @IsInt({ message: 'El anio debe ser un numero entero' })
  @IsOptional()
  anio?: number;

  @ApiPropertyOptional({ description: 'Descripcion o sinopsis' })
  @IsString()
  @IsOptional()
  descripcion?: string;

  @ApiPropertyOptional({ description: 'URL de la portada' })
  @IsString()
  @IsOptional()
  portadaUrl?: string;

  @ApiPropertyOptional({ description: 'Ubicacion fisica', example: 'Estante B-3' })
  @IsString()
  @IsOptional()
  ubicacion?: string;

  @ApiPropertyOptional({ description: 'Numero total de ejemplares', default: 1 })
  @Type(() => Number)
  @IsInt({ message: 'Los ejemplares deben ser un numero entero' })
  @Min(1, { message: 'Debe haber al menos un ejemplar' })
  @IsOptional()
  ejemplaresTotal?: number;
}

export class UpdateBookDto extends PartialType(CreateBookDto) {}

export class QueryBooksDto {
  @ApiPropertyOptional({ description: 'Buscar por titulo, autor o ISBN' })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiPropertyOptional({ description: 'Filtrar por categoria' })
  @IsString()
  @IsOptional()
  categoria?: string;

  @ApiPropertyOptional({ description: 'Solo libros con ejemplares disponibles' })
  @IsString()
  @IsOptional()
  soloDisponibles?: string;
}

export class CreateLoanDto {
  @ApiProperty({ description: 'ID del libro' })
  @IsUUID('4', { message: 'El libro debe ser un UUID valido' })
  bookId: string;

  @ApiPropertyOptional({
    description: 'ID del estudiante. Si se omite, se usa el estudiante autenticado.',
  })
  @IsUUID('4', { message: 'El estudiante debe ser un UUID valido' })
  @IsOptional()
  studentId?: string;

  @ApiPropertyOptional({ description: 'Dias de prestamo', default: 15 })
  @Type(() => Number)
  @IsInt({ message: 'Los dias deben ser un numero entero' })
  @Min(1, { message: 'El prestamo debe ser de al menos un dia' })
  @IsOptional()
  dias?: number;
}

export class QueryLoansDto {
  @ApiPropertyOptional({ description: 'Filtrar por estado', enum: LoanStatus })
  @IsEnum(LoanStatus, { message: 'El estado del prestamo no es valido' })
  @IsOptional()
  estado?: LoanStatus;

  @ApiPropertyOptional({ description: 'Filtrar por estudiante' })
  @IsUUID('4', { message: 'El estudiante debe ser un UUID valido' })
  @IsOptional()
  studentId?: string;
}

export class CreateReservationDto {
  @ApiProperty({ description: 'ID del libro' })
  @IsUUID('4', { message: 'El libro debe ser un UUID valido' })
  bookId: string;

  @ApiPropertyOptional({ description: 'Fecha de expiracion de la reserva (ISO)' })
  @IsDateString({}, { message: 'La fecha de expiracion debe ser valida' })
  @IsOptional()
  fechaExpiracion?: string;
}
