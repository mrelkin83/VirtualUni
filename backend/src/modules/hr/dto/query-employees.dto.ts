import {
  IsString,
  IsOptional,
  IsEnum,
  IsInt,
  Min,
  Max,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { ContractType, Gender, CivilStatus, EmployeeStatus } from '@prisma/client';
import { Transform, Type } from 'class-transformer';

/**
 * DTO para filtrar y paginar empleados
 * Soporta multiples filtros: departamento, cargo, estado, tipo contrato, genero, estado civil
 */
export class QueryEmployeesDto {
  @ApiPropertyOptional({
    description: 'Numero de pagina para paginacion',
    example: 1,
    minimum: 1,
    default: 1,
  })
  @IsInt()
  @Min(1)
  @IsOptional()
  @Type(() => Number)
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Cantidad de registros por pagina',
    example: 20,
    minimum: 1,
    maximum: 100,
    default: 20,
  })
  @IsInt()
  @Min(1)
  @Max(100)
  @IsOptional()
  @Type(() => Number)
  limit?: number = 20;

  @ApiPropertyOptional({
    description: 'Filtrar por departamento (busqueda parcial)',
    example: 'Tecnologia',
  })
  @IsString()
  @IsOptional()
  departamento?: string;

  @ApiPropertyOptional({
    description: 'Filtrar por cargo (busqueda parcial)',
    example: 'Desarrollador',
  })
  @IsString()
  @IsOptional()
  cargo?: string;

  @ApiPropertyOptional({
    description: 'Filtrar por estado del empleado',
    enum: EmployeeStatus,
    example: EmployeeStatus.ACTIVO,
  })
  @IsEnum(EmployeeStatus, {
    message: `El estado debe ser uno de: ${Object.values(EmployeeStatus).join(', ')}`,
  })
  @IsOptional()
  estado?: EmployeeStatus;

  @ApiPropertyOptional({
    description: 'Filtrar por tipo de contrato',
    enum: ContractType,
    example: ContractType.INDEFINIDO,
  })
  @IsEnum(ContractType, {
    message: `El tipo de contrato debe ser uno de: ${Object.values(ContractType).join(', ')}`,
  })
  @IsOptional()
  tipoContrato?: ContractType;

  @ApiPropertyOptional({
    description: 'Filtrar por genero',
    enum: Gender,
    example: Gender.MASCULINO,
  })
  @IsEnum(Gender, {
    message: `El genero debe ser uno de: ${Object.values(Gender).join(', ')}`,
  })
  @IsOptional()
  genero?: Gender;

  @ApiPropertyOptional({
    description: 'Filtrar por estado civil',
    enum: CivilStatus,
    example: CivilStatus.SOLTERO,
  })
  @IsEnum(CivilStatus, {
    message: `El estado civil debe ser uno de: ${Object.values(CivilStatus).join(', ')}`,
  })
  @IsOptional()
  estadoCivil?: CivilStatus;

  @ApiPropertyOptional({
    description: 'Termino de busqueda general (busca en nombre, identificacion, email, cargo)',
    example: 'Juan',
  })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiPropertyOptional({
    description: 'Campo por el cual ordenar',
    example: 'nombre',
    default: 'createdAt',
  })
  @IsString()
  @IsOptional()
  sortBy?: string = 'createdAt';

  @ApiPropertyOptional({
    description: 'Direccion del ordenamiento',
    example: 'desc',
    enum: ['asc', 'desc'],
    default: 'desc',
  })
  @IsString()
  @IsOptional()
  @Transform(({ value }) => value?.toLowerCase())
  sortOrder?: 'asc' | 'desc' = 'desc';
}
