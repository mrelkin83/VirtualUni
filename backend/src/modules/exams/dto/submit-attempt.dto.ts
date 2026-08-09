import { IsObject } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO para el envío de un intento de examen.
 * respuestas es un mapa { [preguntaId]: indiceSeleccionado }
 */
export class SubmitAttemptDto {
  @ApiProperty({
    description: 'Respuestas seleccionadas por pregunta',
    example: { 'question-uuid-1': 0, 'question-uuid-2': 2 },
  })
  @IsObject()
  respuestas: Record<string, number>;
}
