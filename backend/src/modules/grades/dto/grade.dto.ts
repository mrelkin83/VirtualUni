import {
  IsString,
  IsNumber,
  IsOptional,
  IsUUID,
  Min,
  Max,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * El controlador recibia `@Body() data: any` y lo pasaba tal cual a Prisma:
 * el ValidationPipe global no puede filtrar lo que no tiene forma declarada.
 * Un cuerpo cualquiera acababa en un 500 y, en la actualizacion, permitia
 * reasignar la nota a otro estudiante o a otro curso.
 */
export class CreateGradeDto {
  @ApiProperty()
  @IsUUID()
  studentId: string;

  @ApiProperty()
  @IsUUID()
  courseId: string;

  @ApiProperty({ required: false })
  @IsUUID()
  @IsOptional()
  teacherId?: string;

  @ApiProperty({ example: 'PARCIAL' })
  @IsString()
  gradeType: string;

  @ApiProperty({ example: 76.4 })
  @IsNumber()
  @Min(0)
  @Max(100)
  grade: number;

  @ApiProperty({ required: false, example: 0.3 })
  @IsNumber()
  @Min(0)
  @Max(1)
  @IsOptional()
  weight?: number;
}

/**
 * Solo se puede corregir la calificacion en si. `studentId` y `courseId`
 * quedan fuera a proposito: cambiarlos no es corregir una nota, es moverla de
 * expediente.
 */
export class UpdateGradeDto {
  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  gradeType?: string;

  @ApiProperty({ required: false })
  @IsNumber()
  @Min(0)
  @Max(100)
  @IsOptional()
  grade?: number;

  @ApiProperty({ required: false })
  @IsNumber()
  @Min(0)
  @Max(1)
  @IsOptional()
  weight?: number;
}
