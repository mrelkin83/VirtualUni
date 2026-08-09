import {
  IsString,
  IsEmail,
  IsNumber,
  IsEnum,
  IsDateString,
  IsPositive,
  MinLength,
  MaxLength,
  IsOptional,
  Matches,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { ContractType, Gender, CivilStatus, EmployeeStatus } from '@prisma/client';
import { Transform } from 'class-transformer';

/**
 * DTO para la actualizacion de un empleado existente
 * Todos los campos son opcionales para permitir actualizaciones parciales
 */
export class UpdateEmployeeDto {
  @ApiPropertyOptional({
    description: 'Nombre completo del empleado',
    example: 'Juan Carlos Rodriguez Perez',
    minLength: 3,
    maxLength: 200,
  })
  @IsString()
  @IsOptional()
  @MinLength(3, { message: 'El nombre debe tener al menos 3 caracteres' })
  @MaxLength(200, { message: 'El nombre no puede exceder 200 caracteres' })
  nombre?: string;

  @ApiPropertyOptional({
    description: 'Numero de identificacion del empleado',
    example: '1234567890',
    minLength: 5,
    maxLength: 20,
  })
  @IsString()
  @IsOptional()
  @MinLength(5, { message: 'La identificacion debe tener al menos 5 caracteres' })
  @MaxLength(20, { message: 'La identificacion no puede exceder 20 caracteres' })
  @Matches(/^[A-Za-z0-9-]+$/, {
    message: 'La identificacion solo puede contener letras, numeros y guiones',
  })
  identificacion?: string;

  @ApiPropertyOptional({
    description: 'Correo electronico del empleado',
    example: 'juan.rodriguez@empresa.com',
  })
  @IsEmail({}, { message: 'El email debe ser una direccion de correo valida' })
  @IsOptional()
  @Transform(({ value }) => value?.toLowerCase().trim())
  email?: string;

  @ApiPropertyOptional({
    description: 'Numero de telefono del empleado',
    example: '+57 300 123 4567',
    minLength: 7,
    maxLength: 20,
  })
  @IsString()
  @IsOptional()
  @MinLength(7, { message: 'El telefono debe tener al menos 7 caracteres' })
  @MaxLength(20, { message: 'El telefono no puede exceder 20 caracteres' })
  telefono?: string;

  @ApiPropertyOptional({
    description: 'Cargo o posicion del empleado',
    example: 'Desarrollador Senior',
    minLength: 2,
    maxLength: 100,
  })
  @IsString()
  @IsOptional()
  @MinLength(2, { message: 'El cargo debe tener al menos 2 caracteres' })
  @MaxLength(100, { message: 'El cargo no puede exceder 100 caracteres' })
  cargo?: string;

  @ApiPropertyOptional({
    description: 'Departamento al que pertenece el empleado',
    example: 'Tecnologia',
    minLength: 2,
    maxLength: 100,
  })
  @IsString()
  @IsOptional()
  @MinLength(2, { message: 'El departamento debe tener al menos 2 caracteres' })
  @MaxLength(100, { message: 'El departamento no puede exceder 100 caracteres' })
  departamento?: string;

  @ApiPropertyOptional({
    description: 'Fecha de ingreso del empleado en formato ISO',
    example: '2024-01-15',
  })
  @IsDateString({}, { message: 'La fecha de ingreso debe ser una fecha valida en formato ISO' })
  @IsOptional()
  fechaIngreso?: string;

  @ApiPropertyOptional({
    description: 'Tipo de contrato del empleado',
    enum: ContractType,
    example: ContractType.INDEFINIDO,
  })
  @IsEnum(ContractType, {
    message: `El tipo de contrato debe ser uno de: ${Object.values(ContractType).join(', ')}`,
  })
  @IsOptional()
  tipoContrato?: ContractType;

  @ApiPropertyOptional({
    description: 'Salario mensual del empleado',
    example: 3500000,
    minimum: 0,
  })
  @IsNumber({}, { message: 'El salario debe ser un numero' })
  @IsPositive({ message: 'El salario debe ser positivo' })
  @IsOptional()
  @Transform(({ value }) => (value !== undefined ? parseFloat(value) : undefined))
  salario?: number;

  @ApiPropertyOptional({
    description: 'Estado del empleado',
    enum: EmployeeStatus,
    example: EmployeeStatus.ACTIVO,
  })
  @IsEnum(EmployeeStatus, {
    message: `El estado debe ser uno de: ${Object.values(EmployeeStatus).join(', ')}`,
  })
  @IsOptional()
  estado?: EmployeeStatus;

  @ApiPropertyOptional({
    description: 'Direccion de residencia del empleado',
    example: 'Calle 123 #45-67, Edificio Torres, Apto 501',
    minLength: 5,
    maxLength: 300,
  })
  @IsString()
  @IsOptional()
  @MinLength(5, { message: 'La direccion debe tener al menos 5 caracteres' })
  @MaxLength(300, { message: 'La direccion no puede exceder 300 caracteres' })
  direccion?: string;

  @ApiPropertyOptional({
    description: 'Fecha de nacimiento del empleado en formato ISO',
    example: '1990-05-20',
  })
  @IsDateString({}, { message: 'La fecha de nacimiento debe ser una fecha valida en formato ISO' })
  @IsOptional()
  fechaNacimiento?: string;

  @ApiPropertyOptional({
    description: 'Genero del empleado',
    enum: Gender,
    example: Gender.MASCULINO,
  })
  @IsEnum(Gender, {
    message: `El genero debe ser uno de: ${Object.values(Gender).join(', ')}`,
  })
  @IsOptional()
  genero?: Gender;

  @ApiPropertyOptional({
    description: 'Estado civil del empleado',
    enum: CivilStatus,
    example: CivilStatus.SOLTERO,
  })
  @IsEnum(CivilStatus, {
    message: `El estado civil debe ser uno de: ${Object.values(CivilStatus).join(', ')}`,
  })
  @IsOptional()
  estadoCivil?: CivilStatus;

  @ApiPropertyOptional({
    description: 'Nombre del contacto de emergencia',
    example: 'Maria Elena Rodriguez',
    minLength: 3,
    maxLength: 150,
  })
  @IsString()
  @IsOptional()
  @MinLength(3, { message: 'El nombre del contacto debe tener al menos 3 caracteres' })
  @MaxLength(150, { message: 'El nombre del contacto no puede exceder 150 caracteres' })
  contactoEmergenciaNombre?: string;

  @ApiPropertyOptional({
    description: 'Telefono del contacto de emergencia',
    example: '+57 310 987 6543',
    minLength: 7,
    maxLength: 20,
  })
  @IsString()
  @IsOptional()
  @MinLength(7, { message: 'El telefono del contacto debe tener al menos 7 caracteres' })
  @MaxLength(20, { message: 'El telefono del contacto no puede exceder 20 caracteres' })
  contactoEmergenciaTelefono?: string;

  @ApiPropertyOptional({
    description: 'Relacion con el contacto de emergencia',
    example: 'Madre',
    minLength: 2,
    maxLength: 50,
  })
  @IsString()
  @IsOptional()
  @MinLength(2, { message: 'La relacion debe tener al menos 2 caracteres' })
  @MaxLength(50, { message: 'La relacion no puede exceder 50 caracteres' })
  contactoEmergenciaRelacion?: string;
}
