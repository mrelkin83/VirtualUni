import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsNumber,
  IsOptional,
  IsBoolean,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AccountType, AccountCategory } from '@prisma/client';

export class CreateAccountDto {
  @ApiPropertyOptional({
    description: 'Codigo de la cuenta (auto-generado si no se proporciona)',
    example: 'ACC-2025-001',
  })
  @IsString({ message: 'El codigo debe ser una cadena de texto' })
  @IsOptional()
  codigo?: string;

  @ApiProperty({
    description: 'Nombre de la cuenta',
    example: 'Cuenta Principal Bancolombia',
  })
  @IsString({ message: 'El nombre debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El nombre es requerido' })
  @MaxLength(200, { message: 'El nombre no puede exceder 200 caracteres' })
  nombre: string;

  @ApiProperty({
    description: 'Tipo de cuenta',
    enum: AccountType,
    example: AccountType.ACTIVO,
  })
  @IsEnum(AccountType, {
    message: 'El tipo debe ser ACTIVO, PASIVO, PATRIMONIO, INGRESO o EGRESO',
  })
  @IsNotEmpty({ message: 'El tipo es requerido' })
  tipo: AccountType;

  @ApiProperty({
    description: 'Categoria de la cuenta',
    enum: AccountCategory,
    example: AccountCategory.BANCO,
  })
  @IsEnum(AccountCategory, {
    message: 'La categoria debe ser una de las categorias validas',
  })
  @IsNotEmpty({ message: 'La categoria es requerida' })
  categoria: AccountCategory;

  @ApiPropertyOptional({
    description: 'Saldo inicial de la cuenta',
    example: 5000000,
    default: 0,
  })
  @IsNumber({}, { message: 'El saldo debe ser un numero' })
  @IsOptional()
  saldo?: number = 0;

  @ApiPropertyOptional({
    description: 'Moneda de la cuenta',
    example: 'COP',
    default: 'COP',
  })
  @IsString({ message: 'La moneda debe ser una cadena de texto' })
  @IsOptional()
  @MaxLength(10, { message: 'La moneda no puede exceder 10 caracteres' })
  moneda?: string = 'COP';

  @ApiPropertyOptional({
    description: 'Descripcion de la cuenta',
    example: 'Cuenta corriente principal para operaciones diarias',
  })
  @IsString({ message: 'La descripcion debe ser una cadena de texto' })
  @IsOptional()
  descripcion?: string;

  @ApiPropertyOptional({
    description: 'Indica si la cuenta esta activa',
    example: true,
    default: true,
  })
  @IsBoolean({ message: 'El campo activa debe ser un booleano' })
  @IsOptional()
  activa?: boolean = true;
}
