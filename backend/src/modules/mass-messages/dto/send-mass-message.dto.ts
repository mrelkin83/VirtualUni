import { IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO para enviar un mensaje masivo programado
 */
export class SendMassMessageDto {
  @ApiProperty({
    description: 'ID del mensaje a enviar',
    example: 'uuid-string',
  })
  @IsUUID()
  messageId: string;
}
