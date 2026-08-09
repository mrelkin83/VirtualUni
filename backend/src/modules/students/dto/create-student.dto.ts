import { IsString, IsOptional, IsDateString, IsEmail } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateStudentDto {
  @ApiProperty({ example: 'Juan' })
  @IsString()
  firstName: string;

  @ApiProperty({ example: 'Pérez' })
  @IsString()
  lastName: string;

  @ApiProperty({ example: 'estudiante@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'Password123!' })
  @IsString()
  password: string;

  @ApiProperty({ example: 'Ingeniería de Sistemas', required: false })
  @IsString()
  @IsOptional()
  program?: string;

  @ApiProperty({ example: '2024-1', required: false })
  @IsString()
  @IsOptional()
  semester?: string;

  @ApiProperty({ example: 'CC', required: false })
  @IsString()
  @IsOptional()
  tipoIdentificacion?: string;

  @ApiProperty({ example: '1234567890', required: false })
  @IsString()
  @IsOptional()
  numeroIdentificacion?: string;

  @ApiProperty({ example: 'M', required: false })
  @IsString()
  @IsOptional()
  sexo?: string;

  @ApiProperty({ example: '3001234567', required: false })
  @IsString()
  @IsOptional()
  telefono?: string;

  @ApiProperty({ example: '3001234567', required: false })
  @IsString()
  @IsOptional()
  celular?: string;

  @ApiProperty({ example: '1990-01-01', required: false })
  @IsDateString()
  @IsOptional()
  fechaNacimiento?: string;

  @ApiProperty({ example: 'Bogotá', required: false })
  @IsString()
  @IsOptional()
  lugarNacimiento?: string;

  @ApiProperty({ example: 'Calle 123 #45-67', required: false })
  @IsString()
  @IsOptional()
  direccion?: string;

  @ApiProperty({ example: 'Bogotá', required: false })
  @IsString()
  @IsOptional()
  lugarResidencia?: string;

  @ApiProperty({ example: 'Centro', required: false })
  @IsString()
  @IsOptional()
  barrio?: string;

  @ApiProperty({ example: 'Urbana', required: false })
  @IsString()
  @IsOptional()
  zona?: string;

  @ApiProperty({ example: '3', required: false })
  @IsString()
  @IsOptional()
  estrato?: string;
}
