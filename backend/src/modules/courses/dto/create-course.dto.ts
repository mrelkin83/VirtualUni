import { IsString, IsOptional, IsInt, Min, IsNotEmpty, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCourseDto {
  @ApiProperty({ example: 'CS101' })
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiProperty({ example: 'Introducción a la Programación' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'Curso básico de programación en Python', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: 4 })
  @IsInt()
  @Min(1)
  @IsOptional()
  credits?: number;

  @ApiProperty({ example: '2024-1', required: false })
  @IsString()
  @IsOptional()
  semester?: string;

  @ApiProperty({ example: 'bg-blue-500', required: false })
  @IsString()
  @IsOptional()
  color?: string;

  @ApiProperty({ example: 'teacher-uuid-here' })
  @IsUUID()
  @IsNotEmpty()
  teacherId: string;
}
