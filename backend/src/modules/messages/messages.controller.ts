import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { MessagesService } from './messages.service';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { TenantGuard } from '@/common/guards/tenant.guard';
import { CurrentTenant } from '@/common/decorators/current-tenant.decorator';
import { CurrentUser } from '@/common/decorators/current-user.decorator';

@ApiTags('messages')
@Controller('messages')
@UseGuards(JwtAuthGuard, TenantGuard)
@ApiBearerAuth()
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Post()
  create(@Body() data: any, @CurrentTenant() tenantId: string) {
    return this.messagesService.create(data, tenantId);
  }

  @Get('inbox')
  getInbox(@CurrentUser() user: any, @CurrentTenant() tenantId: string) {
    return this.messagesService.findInbox(user.id, tenantId);
  }

  @Get('sent')
  getSent(@CurrentUser() user: any, @CurrentTenant() tenantId: string) {
    return this.messagesService.findSent(user.id, tenantId);
  }

  @Get('unread-count')
  getUnreadCount(@CurrentUser() user: any, @CurrentTenant() tenantId: string) {
    return this.messagesService.getUnreadCount(user.id, tenantId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentTenant() tenantId: string) {
    return this.messagesService.findOne(id, tenantId);
  }

  @Patch(':id/read')
  markAsRead(@Param('id') id: string, @CurrentTenant() tenantId: string) {
    return this.messagesService.markAsRead(id, tenantId);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentTenant() tenantId: string) {
    return this.messagesService.remove(id, tenantId);
  }
}
