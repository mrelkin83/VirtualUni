import {
  IsString,
  IsEnum,
  IsOptional,
  IsNumber,
  IsNotEmpty,
  IsDateString,
  IsUUID,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PaymentMethod } from '@prisma/client';

export class CreatePaymentDto {
  @ApiProperty({ description: 'ID de la factura asociada' })
  @IsUUID('4', { message: 'El ID de la factura debe ser un UUID valido' })
  @IsNotEmpty({ message: 'La factura es requerida' })
  invoiceId: string;

  @ApiProperty({ description: 'Monto pagado', example: 500000 })
  @IsNumber({}, { message: 'El monto debe ser un numero' })
  @Min(0, { message: 'El monto no puede ser negativo' })
  monto: number;

  @ApiProperty({ description: 'Metodo de pago', enum: PaymentMethod })
  @IsEnum(PaymentMethod, { message: 'El metodo de pago no es valido' })
  metodoPago: PaymentMethod;

  @ApiPropertyOptional({ description: 'Referencia del pago', example: 'TRX-98213' })
  @IsString({ message: 'La referencia debe ser una cadena de texto' })
  @IsOptional()
  referencia?: string;

  @ApiProperty({ description: 'Fecha del pago (ISO)', example: '2026-01-20' })
  @IsDateString({}, { message: 'La fecha debe ser una fecha valida' })
  fecha: string;

  @ApiPropertyOptional({ description: 'URL del comprobante' })
  @IsString({ message: 'El comprobante debe ser una cadena de texto' })
  @IsOptional()
  comprobante?: string;

  @ApiPropertyOptional({ description: 'Notas adicionales' })
  @IsString({ message: 'Las notas deben ser una cadena de texto' })
  @IsOptional()
  notas?: string;
}
