import { PartialType } from '@nestjs/swagger';
import { CreateInventoryItemDto } from './create-inventory-item.dto';

/**
 * DTO para la actualizacion de un item de inventario existente
 * Hereda todas las propiedades de CreateInventoryItemDto como opcionales
 */
export class UpdateInventoryItemDto extends PartialType(CreateInventoryItemDto) {}
