import { IsBoolean, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CancelSubscriptionDto {
  @ApiProperty({
    example: false,
    description: 'If true, cancels immediately. Otherwise, cancels at period end.',
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  immediately?: boolean;
}
