import { PartialType } from '@nestjs/swagger';
import { CreateAssetDto } from './create-asset.dto';

/**
 * DTO para la actualizacion de un activo existente
 * Hereda todas las propiedades de CreateAssetDto como opcionales
 */
export class UpdateAssetDto extends PartialType(CreateAssetDto) {}
