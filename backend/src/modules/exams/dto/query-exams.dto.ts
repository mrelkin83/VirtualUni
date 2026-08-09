import { IsOptional, IsString, IsEnum } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { ExamStatus } from '@prisma/client';

/**
 * DTO para el filtrado de exámenes
 */
export class QueryExamsDto {
  @ApiPropertyOptional({
    description: 'Filtrar por curso',
  })
  @IsOptional()
  @IsString()
  courseId?: string;

  @ApiPropertyOptional({
    description: 'Filtrar por estado',
    enum: ExamStatus,
  })
  @IsOptional()
  @IsEnum(ExamStatus)
  estado?: ExamStatus;
}
