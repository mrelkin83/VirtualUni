import {
  IsString,
  IsEmail,
  IsEnum,
  IsDateString,
  IsNumber,
  IsNotEmpty,
  MinLength,
  MaxLength,
  Min,
  IsPositive,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ContractType, EmployeeStatus, Gender, CivilStatus } from '@prisma/client';
import { Transform } from 'class-transformer';

/**
 * DTO para la creacion de un nuevo empleado en Recursos Humanos
 * Incluye validaciones robustas para todos los campos requeridos
 */
export class CreateEmployeeDto {
  @ApiProperty({
    description: 'Nombre completo del empleado',
    example: 'Maria Elena Rodriguez Perez',
  })
  @IsString()
  @IsNotEmpty({ message: 'El nombre es requerido' })
  @MinLength(3, { message: 'El nombre debe tener al menos 3 caracteres' })
  @MaxLength(200, { message: 'El nombre no puede exceder 200 caracteres' })
  nombre: string;

  @ApiProperty({
    description: 'Numero de identificacion del empleado',
    example: '1234567890',
  })
  @IsString()
  @IsNotEmpty({ message: 'La identificacion es requerida' })
  @MinLength(5, { message: 'La identificacion debe tener al menos 5 caracteres' })
  @MaxLength(50, { message: 'La identificacion no puede exceder 50 caracteres' })
  identificacion: string;

  @ApiProperty({
    description: 'Correo electronico del empleado',
    example: 'maria.rodriguez@empresa.com',
  })
  @IsEmail({}, { message: 'El email debe ser un correo valido' })
  @IsNotEmpty({ message: 'El email es requerido' })
  email: string;

  @ApiProperty({
    description: 'Numero de telefono del empleado',
    example: '3001234567',
  })
  @IsString()
  @IsNotEmpty({ message: 'El telefono es requerido' })
  @MinLength(7, { message: 'El telefono debe tener al menos 7 caracteres' })
  @MaxLength(20, { message: 'El telefono no puede exceder 20 caracteres' })
  telefono: string;

  @ApiProperty({
    description: 'Cargo del empleado',
    example: 'Coordinador Academico',
  })
  @IsString()
  @IsNotEmpty({ message: 'El cargo es requerido' })
  @MinLength(3, { message: 'El cargo debe tener al menos 3 caracteres' })
  @MaxLength(100, { message: 'El cargo no puede exceder 100 caracteres' })
  cargo: string;

  @ApiProperty({
    description: 'Departamento al que pertenece el empleado',
    example: 'Academico',
  })
  @IsString()
  @IsNotEmpty({ message: 'El departamento es requerido' })
  @MinLength(2, { message: 'El departamento debe tener al menos 2 caracteres' })
  @MaxLength(100, { message: 'El departamento no puede exceder 100 caracteres' })
  departamento: string;

  @ApiProperty({
    description: 'Fecha de ingreso del empleado en formato ISO',
    example: '2024-01-15',
  })
  @IsDateString({}, { message: 'La fecha de ingreso debe ser una fecha valida en formato ISO' })
  @IsNotEmpty({ message: 'La fecha de ingreso es requerida' })
  fechaIngreso: string;

  @ApiProperty({
    description: 'Tipo de contrato del empleado',
    enum: ContractType,
    example: ContractType.INDEFINIDO,
  })
  @IsEnum(ContractType, {
    message: `El tipo de contrato debe ser uno de: ${Object.values(ContractType).join(', ')}`,
  })
  @IsNotEmpty({ message: 'El tipo de contrato es requerido' })
  tipoContrato: ContractType;

  @ApiProperty({
    description: 'Salario mensual del empleado',
    example: 3500000,
    minimum: 0,
  })
  @IsNumber({}, { message: 'El salario debe ser un numero' })
  @IsPositive({ message: 'El salario debe ser positivo' })
  @Transform(({ value }) => parseFloat(value))
  salario: number;

  @ApiProperty({
    description: 'Estado actual del empleado',
    enum: EmployeeStatus,
    example: EmployeeStatus.ACTIVO,
  })
  @IsEnum(EmployeeStatus, {
    message: `El estado debe ser uno de: ${Object.values(EmployeeStatus).join(', ')}`,
  })
  @IsNotEmpty({ message: 'El estado es requerido' })
  estado: EmployeeStatus;

  @ApiProperty({
    description: 'Direccion de residencia del empleado',
    example: 'Calle 123 # 45-67, Bogota',
  })
  @IsString()
  @IsNotEmpty({ message: 'La direccion es requerida' })
  @MinLength(5, { message: 'La direccion debe tener al menos 5 caracteres' })
  @MaxLength(300, { message: 'La direccion no puede exceder 300 caracteres' })
  direccion: string;

  @ApiProperty({
    description: 'Fecha de nacimiento del empleado en formato ISO',
    example: '1990-05-20',
  })
  @IsDateString({}, { message: 'La fecha de nacimiento debe ser una fecha valida en formato ISO' })
  @IsNotEmpty({ message: 'La fecha de nacimiento es requerida' })
  fechaNacimiento: string;

  @ApiProperty({
    description: 'Genero del empleado',
    enum: Gender,
    example: Gender.FEMENINO,
  })
  @IsEnum(Gender, {
    message: `El genero debe ser uno de: ${Object.values(Gender).join(', ')}`,
  })
  @IsNotEmpty({ message: 'El genero es requerido' })
  genero: Gender;

  @ApiProperty({
    description: 'Estado civil del empleado',
    enum: CivilStatus,
    example: CivilStatus.SOLTERO,
  })
  @IsEnum(CivilStatus, {
    message: `El estado civil debe ser uno de: ${Object.values(CivilStatus).join(', ')}`,
  })
  @IsNotEmpty({ message: 'El estado civil es requerido' })
  estadoCivil: CivilStatus;

  @ApiProperty({
    description: 'Nombre del contacto de emergencia',
    example: 'Juan Rodriguez',
  })
  @IsString()
  @IsNotEmpty({ message: 'El nombre del contacto de emergencia es requerido' })
  @MinLength(3, { message: 'El nombre del contacto debe tener al menos 3 caracteres' })
  @MaxLength(150, { message: 'El nombre del contacto no puede exceder 150 caracteres' })
  contactoEmergenciaNombre: string;

  @ApiProperty({
    description: 'Telefono del contacto de emergencia',
    example: '3009876543',
  })
  @IsString()
  @IsNotEmpty({ message: 'El telefono del contacto de emergencia es requerido' })
  @MinLength(7, { message: 'El telefono del contacto debe tener al menos 7 caracteres' })
  @MaxLength(20, { message: 'El telefono del contacto no puede exceder 20 caracteres' })
  contactoEmergenciaTelefono: string;

  @ApiProperty({
    description: 'Relacion con el contacto de emergencia',
    example: 'Hermano',
  })
  @IsString()
  @IsNotEmpty({ message: 'La relacion con el contacto de emergencia es requerida' })
  @MinLength(3, { message: 'La relacion debe tener al menos 3 caracteres' })
  @MaxLength(50, { message: 'La relacion no puede exceder 50 caracteres' })
  contactoEmergenciaRelacion: string;
}
