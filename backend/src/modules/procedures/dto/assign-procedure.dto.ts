import { IsString, IsUUID, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO para asignar un trámite a un usuario
 */
export class AssignProcedureDto {
  @ApiProperty({
    description: 'ID del usuario a asignar',
    example: 'uuid-string',
  })
  @IsString()
  @IsUUID()
  usuarioId: string;

  @ApiProperty({
    description: 'Comentario de asignación',
    example: 'Se asigna a Juan para procesamiento',
    maxLength: 500,
  })
  @IsString()
  @MaxLength(500)
  comentario?: string;
}
