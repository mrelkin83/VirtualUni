import { IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CrearPlantillaMensajeDto {
  @ApiProperty()
  @IsString()
  nombre: string;

  @ApiProperty()
  @IsString()
  contenido: string;

  @ApiProperty({ required: false, example: 'recordatorio' })
  @IsString()
  @IsOptional()
  categoria?: string;
}

export class ActualizarPlantillaMensajeDto extends CrearPlantillaMensajeDto {
  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  declare nombre: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  declare contenido: string;
}
