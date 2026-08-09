import { IsString, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * Sin `senderId`: antes el controlador recibia `@Body() data: any` y lo pasaba
 * entero a Prisma, asi que cualquiera podia enviar un mensaje haciendose pasar
 * por otra persona. El remitente sale ahora del token.
 */
export class CreateMessageDto {
  @ApiProperty()
  @IsUUID()
  recipientId: string;

  @ApiProperty()
  @IsString()
  subject: string;

  @ApiProperty()
  @IsString()
  body: string;
}
