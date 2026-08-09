import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsNumber,
  IsOptional,
  IsDateString,
  Min,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TransactionType, TransactionStatus } from '@prisma/client';

export class CreateTransactionDto {
  @ApiPropertyOptional({
    description: 'Codigo de la transaccion (auto-generado si no se proporciona)',
    example: 'TRN-2025-001',
  })
  @IsString({ message: 'El codigo debe ser una cadena de texto' })
  @IsOptional()
  codigo?: string;

  @ApiProperty({
    description: 'Tipo de transaccion',
    enum: TransactionType,
    example: TransactionType.INGRESO,
  })
  @IsEnum(TransactionType, {
    message: 'El tipo debe ser INGRESO o EGRESO',
  })
  @IsNotEmpty({ message: 'El tipo es requerido' })
  tipo: TransactionType;

  @ApiProperty({
    description: 'Categoria de la transaccion',
    example: 'Matriculas',
  })
  @IsString({ message: 'La categoria debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'La categoria es requerida' })
  @MaxLength(100, { message: 'La categoria no puede exceder 100 caracteres' })
  categoria: string;

  @ApiProperty({
    description: 'Concepto de la transaccion',
    example: 'Pago de matricula semestre 2025-1',
  })
  @IsString({ message: 'El concepto debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El concepto es requerido' })
  @MaxLength(200, { message: 'El concepto no puede exceder 200 caracteres' })
  concepto: string;

  @ApiProperty({
    description: 'Monto de la transaccion',
    example: 1500000,
    minimum: 0,
  })
  @IsNumber({}, { message: 'El monto debe ser un numero' })
  @Min(0, { message: 'El monto debe ser mayor o igual a 0' })
  @IsNotEmpty({ message: 'El monto es requerido' })
  monto: number;

  @ApiProperty({
    description: 'Fecha de la transaccion',
    example: '2025-01-15',
  })
  @IsDateString({}, { message: 'La fecha debe ser una fecha valida' })
  @IsNotEmpty({ message: 'La fecha es requerida' })
  fecha: string;

  @ApiPropertyOptional({
    description: 'Metodo de pago',
    example: 'Transferencia bancaria',
  })
  @IsString({ message: 'El metodo de pago debe ser una cadena de texto' })
  @IsOptional()
  @MaxLength(100, { message: 'El metodo de pago no puede exceder 100 caracteres' })
  metodoPago?: string;

  @ApiPropertyOptional({
    description: 'Referencia de la transaccion',
    example: 'REF-123456',
  })
  @IsString({ message: 'La referencia debe ser una cadena de texto' })
  @IsOptional()
  @MaxLength(100, { message: 'La referencia no puede exceder 100 caracteres' })
  referencia?: string;

  @ApiPropertyOptional({
    description: 'Estudiante relacionado con la transaccion',
    example: 'Juan Perez - EST-2025-001',
  })
  @IsString({ message: 'El estudiante debe ser una cadena de texto' })
  @IsOptional()
  @MaxLength(200, { message: 'El estudiante no puede exceder 200 caracteres' })
  estudiante?: string;

  @ApiPropertyOptional({
    description: 'Descripcion adicional de la transaccion',
    example: 'Pago correspondiente al primer semestre academico',
  })
  @IsString({ message: 'La descripcion debe ser una cadena de texto' })
  @IsOptional()
  descripcion?: string;

  @ApiPropertyOptional({
    description: 'URL del comprobante adjunto',
    example: 'https://storage.example.com/comprobantes/123.pdf',
  })
  @IsString({ message: 'El comprobante debe ser una cadena de texto' })
  @IsOptional()
  comprobante?: string;

  @ApiPropertyOptional({
    description: 'Estado de la transaccion',
    enum: TransactionStatus,
    default: TransactionStatus.PENDIENTE,
  })
  @IsEnum(TransactionStatus, {
    message: 'El estado debe ser PENDIENTE, COMPLETADO, CANCELADO o RECHAZADO',
  })
  @IsOptional()
  estado?: TransactionStatus;

  @ApiPropertyOptional({
    description:
      'Usuario que crea la transaccion. Lo sobrescribe el servidor con el usuario autenticado.',
    example: 'admin@universidad.edu.co',
  })
  @IsString({ message: 'El creador debe ser una cadena de texto' })
  @MaxLength(200, { message: 'El creador no puede exceder 200 caracteres' })
  @IsOptional()
  creadoPor?: string;
}
