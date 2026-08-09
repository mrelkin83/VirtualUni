import {
  IsString,
  IsOptional,
  IsEnum,
  IsInt,
  Min,
  Max,
  Matches,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { EmployeeStatus, PayrollStatus } from '@prisma/client';
import { Transform, Type } from 'class-transformer';

/**
 * DTO para filtrar y paginar empleados de nomina
 * Soporta busqueda por departamento, cargo, estado y termino de busqueda
 */
export class QueryPayrollEmployeesDto {
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
    description: 'Termino de busqueda general (busca en nombre, identificacion, cargo)',
    example: 'Juan',
  })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiPropertyOptional({
    description: 'Campo por el cual ordenar',
    example: 'createdAt',
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

/**
 * DTO para filtrar y paginar registros de nomina
 * Soporta filtros por periodo, estado, departamento y empleado
 */
export class QueryPayrollRecordsDto {
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
    description: 'Filtrar por periodo en formato YYYY-MM',
    example: '2024-01',
  })
  @IsString()
  @IsOptional()
  @Matches(/^\d{4}-(0[1-9]|1[0-2])$/, {
    message: 'El periodo debe tener formato YYYY-MM (ej: 2024-01)',
  })
  periodo?: string;

  @ApiPropertyOptional({
    description: 'Filtrar por estado del registro de nomina',
    enum: PayrollStatus,
    example: PayrollStatus.PROCESADO,
  })
  @IsEnum(PayrollStatus, {
    message: `El estado debe ser uno de: ${Object.values(PayrollStatus).join(', ')}`,
  })
  @IsOptional()
  estado?: PayrollStatus;

  @ApiPropertyOptional({
    description: 'Filtrar por departamento del empleado',
    example: 'Tecnologia',
  })
  @IsString()
  @IsOptional()
  departamento?: string;

  @ApiPropertyOptional({
    description: 'Filtrar por cargo del empleado',
    example: 'Desarrollador',
  })
  @IsString()
  @IsOptional()
  cargo?: string;

  @ApiPropertyOptional({
    description: 'Filtrar por ID de empleado',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsString()
  @IsOptional()
  empleadoId?: string;

  @ApiPropertyOptional({
    description: 'Campo por el cual ordenar',
    example: 'createdAt',
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
