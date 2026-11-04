import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ReabrirNotasDto {
  @ApiProperty({ description: 'Motivo de la reapertura (queda auditado)' })
  @IsString()
  @MinLength(5)
  @MaxLength(500)
  motivo: string;
}

export class CerrarNotasDto {
  @ApiProperty({ required: false, description: 'Observaciones del acta de cierre' })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  observaciones?: string;
}
