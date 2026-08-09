import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { GradesService } from './grades.service';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { TenantGuard } from '@/common/guards/tenant.guard';
import { CurrentTenant } from '@/common/decorators/current-tenant.decorator';

@ApiTags('grades')
@Controller('grades')
@UseGuards(JwtAuthGuard, TenantGuard)
@ApiBearerAuth()
export class GradesController {
  constructor(private readonly gradesService: GradesService) {}

  @Post()
  create(@Body() data: any, @CurrentTenant() tenantId: string) {
    return this.gradesService.create(data, tenantId);
  }

  @Get('student/:studentId')
  findByStudent(@Param('studentId') studentId: string, @CurrentTenant() tenantId: string) {
    return this.gradesService.findByStudent(studentId, tenantId);
  }

  @Get('course/:courseId')
  findByCourse(@Param('courseId') courseId: string, @CurrentTenant() tenantId: string) {
    return this.gradesService.findByCourse(courseId, tenantId);
  }

  @Get('student/:studentId/average')
  getAverage(
    @Param('studentId') studentId: string,
    @CurrentTenant() tenantId: string,
    @Query('courseId') courseId?: string,
  ) {
    return this.gradesService.getStudentAverage(studentId, tenantId, courseId);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() data: any, @CurrentTenant() tenantId: string) {
    return this.gradesService.update(id, data, tenantId);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentTenant() tenantId: string) {
    return this.gradesService.remove(id, tenantId);
  }
}
