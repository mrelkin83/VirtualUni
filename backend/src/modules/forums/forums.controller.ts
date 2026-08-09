import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { ForumsService } from './forums.service';
import {
  CreateTopicDto,
  UpdateTopicDto,
  QueryTopicsDto,
  CreateReplyDto,
  UpdateReplyDto,
} from './dto';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { TenantGuard } from '@/common/guards/tenant.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { CurrentTenant } from '@/common/decorators/current-tenant.decorator';
import { CurrentUser } from '@/common/decorators/current-user.decorator';

@ApiTags('forums')
@Controller('forums')
@UseGuards(JwtAuthGuard, TenantGuard, RolesGuard)
@Roles('STUDENT', 'TEACHER', 'TENANT_ADMIN', 'SUPER_ADMIN')
@ApiBearerAuth()
export class ForumsController {
  constructor(private readonly forumsService: ForumsService) {}

  @Get('stats')
  @ApiOperation({ summary: 'Estadisticas de los foros' })
  getStats(@CurrentTenant() tenantId: string) {
    return this.forumsService.getStats(tenantId);
  }

  @Post('topics')
  @ApiOperation({ summary: 'Crear un tema' })
  @ApiResponse({ status: 201, description: 'Tema creado' })
  createTopic(
    @Body() dto: CreateTopicDto,
    @CurrentTenant() tenantId: string,
    @CurrentUser('userId') userId: string,
  ) {
    return this.forumsService.createTopic(tenantId, userId, dto);
  }

  @Get('topics')
  @ApiOperation({ summary: 'Listar temas' })
  findAllTopics(@Query() query: QueryTopicsDto, @CurrentTenant() tenantId: string) {
    return this.forumsService.findAllTopics(tenantId, query);
  }

  @Get('topics/:id')
  @ApiOperation({ summary: 'Ver un tema con sus respuestas' })
  findOneTopic(@Param('id') id: string, @CurrentTenant() tenantId: string) {
    return this.forumsService.findOneTopic(tenantId, id);
  }

  @Patch('topics/:id')
  @ApiOperation({ summary: 'Actualizar un tema' })
  updateTopic(
    @Param('id') id: string,
    @Body() dto: UpdateTopicDto,
    @CurrentTenant() tenantId: string,
    @CurrentUser('userId') userId: string,
    @CurrentUser('role') role: string,
  ) {
    return this.forumsService.updateTopic(tenantId, id, dto, userId, role);
  }

  @Delete('topics/:id')
  @ApiOperation({ summary: 'Eliminar un tema' })
  removeTopic(
    @Param('id') id: string,
    @CurrentTenant() tenantId: string,
    @CurrentUser('userId') userId: string,
    @CurrentUser('role') role: string,
  ) {
    return this.forumsService.removeTopic(tenantId, id, userId, role);
  }

  @Post('topics/:id/replies')
  @ApiOperation({ summary: 'Responder a un tema' })
  createReply(
    @Param('id') id: string,
    @Body() dto: CreateReplyDto,
    @CurrentTenant() tenantId: string,
    @CurrentUser('userId') userId: string,
  ) {
    return this.forumsService.createReply(tenantId, id, userId, dto);
  }

  @Patch('replies/:id')
  @ApiOperation({ summary: 'Actualizar una respuesta' })
  updateReply(
    @Param('id') id: string,
    @Body() dto: UpdateReplyDto,
    @CurrentTenant() tenantId: string,
    @CurrentUser('userId') userId: string,
    @CurrentUser('role') role: string,
  ) {
    return this.forumsService.updateReply(tenantId, id, dto, userId, role);
  }

  @Post('replies/:id/like')
  @ApiOperation({ summary: 'Dar like a una respuesta' })
  likeReply(@Param('id') id: string, @CurrentTenant() tenantId: string) {
    return this.forumsService.likeReply(tenantId, id);
  }

  @Delete('replies/:id')
  @ApiOperation({ summary: 'Eliminar una respuesta' })
  removeReply(
    @Param('id') id: string,
    @CurrentTenant() tenantId: string,
    @CurrentUser('userId') userId: string,
    @CurrentUser('role') role: string,
  ) {
    return this.forumsService.removeReply(tenantId, id, userId, role);
  }
}
