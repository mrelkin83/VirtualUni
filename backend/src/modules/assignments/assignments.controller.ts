import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { AssignmentsService } from './assignments.service';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { TenantGuard } from '@/common/guards/tenant.guard';
import { CurrentTenant } from '@/common/decorators/current-tenant.decorator';

@ApiTags('assignments')
@Controller('assignments')
@UseGuards(JwtAuthGuard, TenantGuard)
@ApiBearerAuth()
export class AssignmentsController {
  constructor(private readonly assignmentsService: AssignmentsService) {}

  @Post()
  create(@Body() data: any, @CurrentTenant() tenantId: string) {
    return this.assignmentsService.create(data, tenantId);
  }

  @Get()
  findAll(@CurrentTenant() tenantId: string, @Query('courseId') courseId?: string) {
    return this.assignmentsService.findAll(tenantId, courseId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentTenant() tenantId: string) {
    return this.assignmentsService.findOne(id, tenantId);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() data: any, @CurrentTenant() tenantId: string) {
    return this.assignmentsService.update(id, data, tenantId);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentTenant() tenantId: string) {
    return this.assignmentsService.remove(id, tenantId);
  }

  @Post(':id/submit')
  submit(@Param('id') id: string, @Body() data: any, @CurrentTenant() tenantId: string) {
    return this.assignmentsService.submitAssignment(id, data.studentId, data, tenantId);
  }

  @Post('submissions/:id/grade')
  grade(@Param('id') id: string, @Body() data: any, @CurrentTenant() tenantId: string) {
    return this.assignmentsService.gradeSubmission(id, data.grade, data.feedback, tenantId);
  }
}
