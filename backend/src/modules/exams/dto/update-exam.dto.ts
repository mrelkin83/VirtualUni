import { OmitType, PartialType } from '@nestjs/swagger';
import { CreateExamDto } from './create-exam.dto';

/**
 * DTO para la actualización de exámenes.
 * Todos los campos son opcionales y no se permite cambiar el courseId.
 */
export class UpdateExamDto extends PartialType(
  OmitType(CreateExamDto, ['courseId'] as const),
) {}
