import { IsString, IsEnum, IsOptional } from 'class-validator';

export enum NotificationType {
  INFO = 'INFO',
  WARNING = 'WARNING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR',
}

export class CreateNotificationDto {
  @IsString()
  userId: string;

  @IsString()
  titulo: string;

  @IsString()
  mensaje: string;

  @IsEnum(NotificationType)
  tipo: NotificationType;

  @IsOptional()
  @IsString()
  icono?: string;
}
