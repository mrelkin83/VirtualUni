import {
  IsString,
  IsNumber,
  IsEnum,
  IsUUID,
  IsDateString,
  IsOptional,
  MinLength,
  MaxLength,
  Min,
  IsInt,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { MovementType } from '@prisma/client';
import { Transform } from 'class-transformer';

/**
 * DTO para registrar un movimiento de inventario (entrada/salida/ajuste)
 * Incluye validaciones para asegurar la integridad de los datos
 */
export class CreateInventoryMovementDto {
  @ApiProperty({
    description: 'ID del item de inventario afectado',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID('4', { message: 'El ID del item debe ser un UUID valido' })
  itemId: string;

  @ApiProperty({
    description: 'Tipo de movimiento',
    enum: MovementType,
    example: MovementType.ENTRADA,
  })
  @IsEnum(MovementType, {
    message: `El tipo de movimiento debe ser uno de: ${Object.values(MovementType).join(', ')}`,
  })
  tipo: MovementType;

  @ApiProperty({
    description: 'Cantidad del movimiento (siempre positiva, el tipo determina la operacion)',
    example: 50,
    minimum: 1,
  })
  @IsInt({ message: 'La cantidad debe ser un numero entero' })
  @Min(1, { message: 'La cantidad debe ser al menos 1' })
  @Transform(({ value }) => parseInt(value, 10))
  cantidad: number;

  @ApiProperty({
    description: 'Motivo o justificacion del movimiento',
    example: 'Compra a proveedor - Factura #12345',
  })
  @IsString()
  @MinLength(5, { message: 'El motivo debe tener al menos 5 caracteres' })
  @MaxLength(500, { message: 'El motivo no puede exceder 500 caracteres' })
  motivo: string;

  @ApiProperty({
    description: 'Nombre de la persona responsable del movimiento',
    example: 'Juan Carlos Rodriguez',
  })
  @IsString()
  @MinLength(3, { message: 'El nombre del responsable debe tener al menos 3 caracteres' })
  @MaxLength(150, { message: 'El nombre del responsable no puede exceder 150 caracteres' })
  responsable: string;

  @ApiPropertyOptional({
    description: 'Fecha del movimiento (si no se proporciona, se usa la fecha actual)',
    example: '2024-01-15T10:30:00Z',
  })
  @IsDateString({}, { message: 'La fecha debe ser valida en formato ISO' })
  @IsOptional()
  fecha?: string;
}
