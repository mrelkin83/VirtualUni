import {
  IsString,
  IsEnum,
  IsOptional,
  IsNumber,
  IsNotEmpty,
  IsDateString,
  IsArray,
  IsUUID,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { StudentInvoiceStatus } from '@prisma/client';

export class CreateInvoiceDto {
  @ApiProperty({ description: 'Nombre o identificador del estudiante', example: 'Ana Gomez' })
  @IsString({ message: 'El estudiante debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El estudiante es requerido' })
  estudiante: string;

  @ApiPropertyOptional({
    description: 'ID del estudiante al que se vincula la factura',
  })
  @IsUUID('4', { message: 'El estudiante debe ser un UUID valido' })
  @IsOptional()
  studentId?: string;

  @ApiProperty({
    description: 'Conceptos facturados',
    example: ['Matricula 2026-1', 'Carnet estudiantil'],
    isArray: true,
  })
  @IsArray({ message: 'Los conceptos deben ser un arreglo' })
  @IsString({ each: true, message: 'Cada concepto debe ser una cadena de texto' })
  conceptos: string[];

  @ApiProperty({ description: 'Subtotal antes de descuentos e impuestos', example: 1000000 })
  @IsNumber({}, { message: 'El subtotal debe ser un numero' })
  @Min(0, { message: 'El subtotal no puede ser negativo' })
  subtotal: number;

  @ApiPropertyOptional({ description: 'Descuento aplicado', example: 0, default: 0 })
  @IsNumber({}, { message: 'El descuento debe ser un numero' })
  @Min(0, { message: 'El descuento no puede ser negativo' })
  @IsOptional()
  descuento?: number;

  @ApiPropertyOptional({ description: 'Impuestos aplicados', example: 0, default: 0 })
  @IsNumber({}, { message: 'Los impuestos deben ser un numero' })
  @Min(0, { message: 'Los impuestos no pueden ser negativos' })
  @IsOptional()
  impuestos?: number;

  @ApiProperty({ description: 'Total a pagar', example: 1000000 })
  @IsNumber({}, { message: 'El total debe ser un numero' })
  @Min(0, { message: 'El total no puede ser negativo' })
  total: number;

  @ApiProperty({ description: 'Fecha de emision (ISO)', example: '2026-01-15' })
  @IsDateString({}, { message: 'La fecha de emision debe ser una fecha valida' })
  fechaEmision: string;

  @ApiProperty({ description: 'Fecha de vencimiento (ISO)', example: '2026-02-15' })
  @IsDateString({}, { message: 'La fecha de vencimiento debe ser una fecha valida' })
  fechaVencimiento: string;

  @ApiProperty({ description: 'Estado de la factura', enum: StudentInvoiceStatus })
  @IsEnum(StudentInvoiceStatus, { message: 'El estado de la factura no es valido' })
  estado: StudentInvoiceStatus;

  @ApiPropertyOptional({ description: 'Notas adicionales' })
  @IsString({ message: 'Las notas deben ser una cadena de texto' })
  @IsOptional()
  notas?: string;
}
