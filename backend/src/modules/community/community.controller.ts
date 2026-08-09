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
import { CommunityService } from './community.service';
import { CreatePostDto, UpdatePostDto, CreateCommentDto, QueryPostsDto } from './dto';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { TenantGuard } from '@/common/guards/tenant.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { CurrentTenant } from '@/common/decorators/current-tenant.decorator';
import { CurrentUser } from '@/common/decorators/current-user.decorator';

@ApiTags('community')
@Controller('community')
@UseGuards(JwtAuthGuard, TenantGuard, RolesGuard)
@Roles('STUDENT', 'TEACHER', 'TENANT_ADMIN', 'SUPER_ADMIN')
@ApiBearerAuth()
export class CommunityController {
  constructor(private readonly communityService: CommunityService) {}

  @Post('posts')
  @ApiOperation({ summary: 'Crear una publicacion' })
  @ApiResponse({ status: 201, description: 'Publicacion creada' })
  create(
    @Body() dto: CreatePostDto,
    @CurrentTenant() tenantId: string,
    @CurrentUser('userId') userId: string,
  ) {
    return this.communityService.create(tenantId, userId, dto);
  }

  @Get('posts')
  @ApiOperation({ summary: 'Listar publicaciones' })
  findAll(
    @Query() query: QueryPostsDto,
    @CurrentTenant() tenantId: string,
    @CurrentUser('userId') userId: string,
  ) {
    return this.communityService.findAll(tenantId, userId, query);
  }

  @Get('posts/:id')
  @ApiOperation({ summary: 'Ver una publicacion' })
  findOne(
    @Param('id') id: string,
    @CurrentTenant() tenantId: string,
    @CurrentUser('userId') userId: string,
  ) {
    return this.communityService.findOne(tenantId, id, userId);
  }

  @Post('posts/:id/like')
  @ApiOperation({ summary: 'Dar o quitar like a una publicacion' })
  toggleLike(
    @Param('id') id: string,
    @CurrentTenant() tenantId: string,
    @CurrentUser('userId') userId: string,
  ) {
    return this.communityService.toggleLike(tenantId, id, userId);
  }

  @Post('posts/:id/comments')
  @ApiOperation({ summary: 'Comentar una publicacion' })
  addComment(
    @Param('id') id: string,
    @Body() dto: CreateCommentDto,
    @CurrentTenant() tenantId: string,
    @CurrentUser('userId') userId: string,
  ) {
    return this.communityService.addComment(tenantId, id, userId, dto);
  }

  @Delete('comments/:id')
  @ApiOperation({ summary: 'Eliminar un comentario' })
  removeComment(
    @Param('id') id: string,
    @CurrentTenant() tenantId: string,
    @CurrentUser('userId') userId: string,
    @CurrentUser('role') role: string,
  ) {
    return this.communityService.removeComment(tenantId, id, userId, role);
  }

  @Patch('posts/:id')
  @ApiOperation({ summary: 'Actualizar una publicacion' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdatePostDto,
    @CurrentTenant() tenantId: string,
    @CurrentUser('userId') userId: string,
    @CurrentUser('role') role: string,
  ) {
    return this.communityService.update(tenantId, id, dto, userId, role);
  }

  @Delete('posts/:id')
  @ApiOperation({ summary: 'Eliminar una publicacion' })
  remove(
    @Param('id') id: string,
    @CurrentTenant() tenantId: string,
    @CurrentUser('userId') userId: string,
    @CurrentUser('role') role: string,
  ) {
    return this.communityService.remove(tenantId, id, userId, role);
  }
}
