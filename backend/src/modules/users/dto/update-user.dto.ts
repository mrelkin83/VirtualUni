import { IsString, IsOptional, IsBoolean, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';

/**
 * El controlador recibia `@Body() updateData: any` y el servicio lo pasaba tal
 * cual a `prisma.user.update`. Sin forma declarada, el ValidationPipe global
 * no filtraba nada: un estudiante podia enviarse `{"role":"SUPER_ADMIN"}` y
 * quedaba ascendido, con acceso a todos los tenants. Tampoco habia nada que
 * impidiera tocar `passwordHash`, `email` o `tenantId`.
 *
 * `role` e `isActive` siguen aqui porque la administracion los necesita, pero
 * el controlador solo los acepta a TENANT_ADMIN y SUPER_ADMIN, y unicamente
 * SUPER_ADMIN puede conceder SUPER_ADMIN.
 */
export class UpdateUserDto {
  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  firstName?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  lastName?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  avatarUrl?: string;

  @ApiProperty({ enum: UserRole, required: false })
  @IsEnum(UserRole)
  @IsOptional()
  role?: UserRole;

  @ApiProperty({ required: false })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
