import {
  IsString,
  IsNumber,
  IsEnum,
  IsDateString,
  IsPositive,
  MinLength,
  MaxLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { EmployeeStatus } from '@prisma/client';
import { Transform } from 'class-transformer';

/**
 * DTO para la creacion de un nuevo empleado en nomina
 * Incluye validaciones robustas para todos los campos requeridos
 */
export class CreatePayrollEmployeeDto {
  @ApiProperty({
    description: 'Nombre completo del empleado',
    example: 'Juan Carlos Rodriguez Perez',
  })
  @IsString()
  @MinLength(3, { message: 'El nombre debe tener al menos 3 caracteres' })
  @MaxLength(200, { message: 'El nombre no puede exceder 200 caracteres' })
  nombre: string;

  @ApiProperty({
    description: 'Numero de identificacion del empleado (cedula, pasaporte, etc.)',
    example: '1234567890',
  })
  @IsString()
  @MinLength(5, { message: 'La identificacion debe tener al menos 5 caracteres' })
  @MaxLength(50, { message: 'La identificacion no puede exceder 50 caracteres' })
  identificacion: string;

  @ApiProperty({
    description: 'Cargo del empleado',
    example: 'Desarrollador Senior',
  })
  @IsString()
  @MinLength(3, { message: 'El cargo debe tener al menos 3 caracteres' })
  @MaxLength(100, { message: 'El cargo no puede exceder 100 caracteres' })
  cargo: string;

  @ApiProperty({
    description: 'Departamento al que pertenece el empleado',
    example: 'Tecnologia',
  })
  @IsString()
  @MinLength(2, { message: 'El departamento debe tener al menos 2 caracteres' })
  @MaxLength(100, { message: 'El departamento no puede exceder 100 caracteres' })
  departamento: string;

  @ApiProperty({
    description: 'Salario base mensual del empleado',
    example: 3500000,
    minimum: 0,
  })
  @IsNumber({}, { message: 'El salario base debe ser un numero' })
  @IsPositive({ message: 'El salario base debe ser positivo' })
  @Transform(({ value }) => parseFloat(value))
  salarioBase: number;

  @ApiProperty({
    description: 'Numero de cuenta bancaria para deposito de nomina',
    example: '1234567890123456',
  })
  @IsString()
  @MinLength(10, { message: 'La cuenta bancaria debe tener al menos 10 caracteres' })
  @MaxLength(30, { message: 'La cuenta bancaria no puede exceder 30 caracteres' })
  cuentaBancaria: string;

  @ApiProperty({
    description: 'Nombre del banco donde tiene la cuenta',
    example: 'Bancolombia',
  })
  @IsString()
  @MinLength(3, { message: 'El nombre del banco debe tener al menos 3 caracteres' })
  @MaxLength(100, { message: 'El nombre del banco no puede exceder 100 caracteres' })
  banco: string;

  @ApiProperty({
    description: 'Estado actual del empleado',
    enum: EmployeeStatus,
    example: EmployeeStatus.ACTIVO,
  })
  @IsEnum(EmployeeStatus, {
    message: `El estado debe ser uno de: ${Object.values(EmployeeStatus).join(', ')}`,
  })
  estado: EmployeeStatus;

  @ApiProperty({
    description: 'Fecha de ingreso del empleado en formato ISO',
    example: '2024-01-15',
  })
  @IsDateString({}, { message: 'La fecha de ingreso debe ser una fecha valida en formato ISO' })
  fechaIngreso: string;
}
