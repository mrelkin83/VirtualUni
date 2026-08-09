import {
  Controller,
  Get,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentTenant } from '../../common/decorators/current-tenant.decorator';

@ApiTags('analytics')
@Controller('analytics')
@UseGuards(JwtAuthGuard, TenantGuard, RolesGuard)
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('dashboard')
  @Roles('TENANT_ADMIN', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Get dashboard statistics' })
  @ApiResponse({ status: 200, description: 'Dashboard stats retrieved successfully' })
  async getDashboardStats(@CurrentTenant() tenantId: string) {
    return this.analyticsService.getDashboardStats(tenantId);
  }

  @Get('students')
  @Roles('TENANT_ADMIN', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Get student analytics' })
  @ApiResponse({ status: 200, description: 'Student analytics retrieved successfully' })
  async getStudentAnalytics(@CurrentTenant() tenantId: string) {
    return this.analyticsService.getStudentAnalytics(tenantId);
  }

  @Get('courses')
  @Roles('TENANT_ADMIN', 'SUPER_ADMIN', 'TEACHER')
  @ApiOperation({ summary: 'Get course analytics' })
  @ApiResponse({ status: 200, description: 'Course analytics retrieved successfully' })
  async getCourseAnalytics(@CurrentTenant() tenantId: string) {
    return this.analyticsService.getCourseAnalytics(tenantId);
  }

  @Get('assignments')
  @Roles('TENANT_ADMIN', 'SUPER_ADMIN', 'TEACHER')
  @ApiOperation({ summary: 'Get assignment analytics' })
  @ApiResponse({ status: 200, description: 'Assignment analytics retrieved successfully' })
  async getAssignmentAnalytics(@CurrentTenant() tenantId: string) {
    return this.analyticsService.getAssignmentAnalytics(tenantId);
  }

  @Get('financial')
  @Roles('TENANT_ADMIN', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Get financial analytics' })
  @ApiResponse({ status: 200, description: 'Financial analytics retrieved successfully' })
  async getFinancialAnalytics(
    @CurrentTenant() tenantId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const start = startDate ? new Date(startDate) : undefined;
    const end = endDate ? new Date(endDate) : undefined;
    return this.analyticsService.getFinancialAnalytics(tenantId, start, end);
  }

  @Get('trends')
  @Roles('TENANT_ADMIN', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Get monthly trends' })
  @ApiResponse({ status: 200, description: 'Monthly trends retrieved successfully' })
  async getMonthlyTrends(
    @CurrentTenant() tenantId: string,
    @Query('months') months?: number,
  ) {
    return this.analyticsService.getMonthlyTrends(tenantId, months || 6);
  }

  @Get('report')
  @Roles('TENANT_ADMIN', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Get complete analytics report' })
  @ApiResponse({ status: 200, description: 'Complete report generated successfully' })
  async getCompleteReport(@CurrentTenant() tenantId: string) {
    return this.analyticsService.getCompleteReport(tenantId);
  }
}
