import { IsString, IsOptional, IsDateString, IsEmail } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTeacherDto {
  @ApiProperty({ example: 'María' })
  @IsString()
  firstName: string;

  @ApiProperty({ example: 'González' })
  @IsString()
  lastName: string;

  @ApiProperty({ example: 'profesor@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'Password123!' })
  @IsString()
  password: string;

  @ApiProperty({ example: 'Departamento de Ingeniería', required: false })
  @IsString()
  @IsOptional()
  department?: string;

  @ApiProperty({ example: 'Inteligencia Artificial', required: false })
  @IsString()
  @IsOptional()
  specialization?: string;

  @ApiProperty({ example: '2020-01-15', required: false })
  @IsDateString()
  @IsOptional()
  hireDate?: string;
}
