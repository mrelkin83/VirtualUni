import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ForbiddenException,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { MessagesService } from './messages.service';
import { CreateMessageDto } from './dto/message.dto';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { TenantGuard } from '@/common/guards/tenant.guard';
import { CurrentTenant } from '@/common/decorators/current-tenant.decorator';
import {
  CurrentUser,
  CurrentUserData,
} from '@/common/decorators/current-user.decorator';

@ApiTags('messages')
@Controller('messages')
@UseGuards(JwtAuthGuard, TenantGuard)
@ApiBearerAuth()
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  /**
   * Correspondencia privada: solo la ven quien escribe y quien recibe. Las
   * rutas por id solo filtraban por tenant, asi que cualquier usuario podia
   * leer, marcar como leido o borrar el mensaje de otras dos personas con solo
   * conocer su identificador.
   */
  private async asegurarParticipante(
    id: string,
    tenantId: string,
    user: CurrentUserData,
  ) {
    const mensaje = await this.messagesService.findOne(id, tenantId);
    if (
      mensaje.senderId !== user.userId &&
      mensaje.recipientId !== user.userId
    ) {
      throw new ForbiddenException('Este mensaje no es tuyo');
    }
    return mensaje;
  }

  @Post()
  @ApiOperation({ summary: 'Enviar un mensaje' })
  create(
    @Body() data: CreateMessageDto,
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: CurrentUserData,
  ) {
    // El remitente sale del token: antes venia en el cuerpo y permitia
    // suplantar a cualquiera.
    return this.messagesService.create(
      { ...data, senderId: user.userId },
      tenantId,
    );
  }

  @Get('inbox')
  getInbox(
    @CurrentUser() user: CurrentUserData,
    @CurrentTenant() tenantId: string,
  ) {
    return this.messagesService.findInbox(user.userId, tenantId);
  }

  @Get('sent')
  getSent(
    @CurrentUser() user: CurrentUserData,
    @CurrentTenant() tenantId: string,
  ) {
    return this.messagesService.findSent(user.userId, tenantId);
  }

  @Get('unread-count')
  getUnreadCount(
    @CurrentUser() user: CurrentUserData,
    @CurrentTenant() tenantId: string,
  ) {
    return this.messagesService.getUnreadCount(user.userId, tenantId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Leer un mensaje' })
  findOne(
    @Param('id') id: string,
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: CurrentUserData,
  ) {
    return this.asegurarParticipante(id, tenantId, user);
  }

  @Patch(':id/read')
  @ApiOperation({ summary: 'Marcar como leído' })
  async markAsRead(
    @Param('id') id: string,
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: CurrentUserData,
  ) {
    const mensaje = await this.asegurarParticipante(id, tenantId, user);
    // Marcar como leido solo tiene sentido para quien lo recibe.
    if (mensaje.recipientId !== user.userId) {
      throw new ForbiddenException('Solo el destinatario puede marcarlo leído');
    }
    return this.messagesService.markAsRead(id, tenantId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar un mensaje' })
  async remove(
    @Param('id') id: string,
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: CurrentUserData,
  ) {
    await this.asegurarParticipante(id, tenantId, user);
    return this.messagesService.remove(id, tenantId);
  }
}
