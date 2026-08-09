import {
  IsString,
  IsNumber,
  IsOptional,
  IsUUID,
  IsDateString,
  Min,
  Max,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * El controlador recibia `@Body() data: any` en todas sus rutas, asi que el
 * ValidationPipe global no tenia forma alguna que filtrar y el cuerpo llegaba
 * en crudo a Prisma.
 */
export class CreateAssignmentDto {
  @ApiProperty()
  @IsUUID()
  courseId: string;

  @ApiProperty()
  @IsString()
  title: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ required: false })
  @IsDateString()
  @IsOptional()
  dueDate?: string;

  @ApiProperty({ required: false, example: 100 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  totalPoints?: number;
}

/** `courseId` queda fuera: mover una tarea de curso no es editarla. */
export class UpdateAssignmentDto {
  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ required: false })
  @IsDateString()
  @IsOptional()
  dueDate?: string;

  @ApiProperty({ required: false })
  @IsNumber()
  @Min(0)
  @IsOptional()
  totalPoints?: number;
}

/**
 * Sin `studentId`: antes se tomaba del cuerpo, de modo que cualquiera podia
 * entregar en nombre de otro alumno. Ahora sale del token.
 */
export class SubmitAssignmentDto {
  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  content?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  fileUrl?: string;
}

export class GradeSubmissionDto {
  @ApiProperty({ example: 95.5 })
  @IsNumber()
  @Min(0)
  @Max(100)
  grade: number;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  feedback?: string;
}
