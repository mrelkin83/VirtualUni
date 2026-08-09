import { IsString, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

/**
 * DTO para filtrar la asistencia del estudiante actual
 */
export class MyAttendanceDto {
  @ApiPropertyOptional({
    description: 'Filtrar por ID del curso',
    example: '3f2504e0-4f89-11d3-9a0c-0305e82c3301',
  })
  @IsOptional()
  @IsString()
  courseId?: string;
}
