import { IsEnum, IsNotEmpty, IsUrl } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Plan } from '@prisma/client';

// No lleva `tenantId`: el checkout siempre se crea para el tenant del JWT
// autenticado (ver BillingController.createCheckout). Aceptarlo desde el
// cliente permitía a un TENANT_ADMIN facturar en nombre de otro tenant.
export class CreateCheckoutSessionDto {
  @ApiProperty({ enum: Plan, example: Plan.BASIC })
  @IsEnum(Plan)
  @IsNotEmpty()
  plan: Plan;

  @ApiProperty({ example: 'http://localhost:5173/success' })
  @IsUrl()
  @IsNotEmpty()
  successUrl: string;

  @ApiProperty({ example: 'http://localhost:5173/cancel' })
  @IsUrl()
  @IsNotEmpty()
  cancelUrl: string;
}
