import {
  Controller,
  Get,
  Patch,
  Delete,
  Param,
  Query,
  UseGuards,
  Post,
} from '@nestjs/common';
import { AlertsService } from './alerts.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentTenant } from '../../common/decorators/current-tenant.decorator';

@Controller('alerts')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AlertsController {
  constructor(private readonly alertsService: AlertsService) {}

  /**
   * Get all alerts for the current tenant
   * GET /api/v1/alerts?onlyUnread=true
   */
  @Get()
  @Roles('TENANT_ADMIN', 'SUPER_ADMIN')
  getAlerts(
    @CurrentTenant() tenantId: string,
    @Query('onlyUnread') onlyUnread?: string,
  ) {
    const unreadOnly = onlyUnread === 'true';
    return this.alertsService.getAlerts(tenantId, unreadOnly);
  }

  /**
   * Get unread alerts count
   * GET /api/v1/alerts/unread-count
   */
  @Get('unread-count')
  @Roles('TENANT_ADMIN', 'SUPER_ADMIN')
  getUnreadCount(@CurrentTenant() tenantId: string) {
    const count = this.alertsService.getUnreadCount(tenantId);
    return { count };
  }

  /**
   * Get alert statistics
   * GET /api/v1/alerts/stats
   */
  @Get('stats')
  @Roles('TENANT_ADMIN', 'SUPER_ADMIN')
  getStats(@CurrentTenant() tenantId: string) {
    return this.alertsService.getStats(tenantId);
  }

  /**
   * Manually trigger alert check for current tenant
   * POST /api/v1/alerts/check
   */
  @Post('check')
  @Roles('TENANT_ADMIN', 'SUPER_ADMIN')
  async checkAlerts(@CurrentTenant() tenantId: string) {
    const newAlerts = await this.alertsService.checkAlertsForTenant(tenantId);
    return {
      message: `Alert check completed. ${newAlerts.length} new alerts generated.`,
      newAlerts,
    };
  }

  /**
   * Mark a specific alert as read
   * PATCH /api/v1/alerts/:id/read
   */
  @Patch(':id/read')
  @Roles('TENANT_ADMIN', 'SUPER_ADMIN')
  markAsRead(
    @CurrentTenant() tenantId: string,
    @Param('id') alertId: string,
  ) {
    const success = this.alertsService.markAsRead(tenantId, alertId);
    return {
      success,
      message: success
        ? 'Alert marked as read'
        : 'Alert not found',
    };
  }

  /**
   * Mark all alerts as read
   * PATCH /api/v1/alerts/mark-all-read
   */
  @Patch('mark-all-read')
  @Roles('TENANT_ADMIN', 'SUPER_ADMIN')
  markAllAsRead(@CurrentTenant() tenantId: string) {
    const count = this.alertsService.markAllAsRead(tenantId);
    return {
      count,
      message: `${count} alerts marked as read`,
    };
  }

  /**
   * Delete a specific alert
   * DELETE /api/v1/alerts/:id
   */
  @Delete(':id')
  @Roles('TENANT_ADMIN', 'SUPER_ADMIN')
  deleteAlert(
    @CurrentTenant() tenantId: string,
    @Param('id') alertId: string,
  ) {
    const success = this.alertsService.deleteAlert(tenantId, alertId);
    return {
      success,
      message: success
        ? 'Alert deleted successfully'
        : 'Alert not found',
    };
  }

  /**
   * Clear all alerts for current tenant
   * DELETE /api/v1/alerts
   */
  @Delete()
  @Roles('TENANT_ADMIN', 'SUPER_ADMIN')
  clearAlerts(@CurrentTenant() tenantId: string) {
    this.alertsService.clearAlerts(tenantId);
    return {
      message: 'All alerts cleared successfully',
    };
  }
}
