import { PartialType } from '@nestjs/swagger';
import { CreateCardTemplateDto } from './create-template.dto';

/**
 * DTO para actualizar una plantilla de carnet
 * Todos los campos son opcionales
 */
export class UpdateCardTemplateDto extends PartialType(CreateCardTemplateDto) {}
