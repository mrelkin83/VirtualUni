import {
  Controller,
  Get,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
  ForbiddenException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import {
  CurrentUser,
  CurrentUserData,
} from '@/common/decorators/current-user.decorator';

@ApiTags('users')
@Controller('users')
// Este controlador no tenia RolesGuard. Un estudiante podia leer el directorio
// completo del tenant, renombrar y desactivar al administrador, y ascenderse a
// SUPER_ADMIN.
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  private esAdministracion(user: CurrentUserData) {
    return user?.role === 'TENANT_ADMIN' || user?.role === 'SUPER_ADMIN';
  }

  @Get()
  // El directorio trae el correo y el nombre de los 32 usuarios del tenant, y
  // los datos laborales de cada docente. En manos del alumnado es una lista de
  // objetivos para phishing dirigido, y ningun panel de estudiante la usa.
  @Roles('TENANT_ADMIN', 'TEACHER', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Get all users in tenant' })
  @ApiResponse({ status: 200, description: 'Users retrieved successfully' })
  findAll(@CurrentUser() user: CurrentUserData) {
    return this.usersService.findAll(user.tenantId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiResponse({ status: 200, description: 'User found' })
  @ApiResponse({ status: 404, description: 'User not found' })
  findOne(@Param('id') id: string, @CurrentUser() user: CurrentUserData) {
    if (
      user.userId !== id &&
      !this.esAdministracion(user) &&
      user.role !== 'TEACHER'
    ) {
      throw new ForbiddenException('Solo puedes consultar tu propio perfil');
    }
    return this.usersService.findOne(id, user.tenantId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update user' })
  @ApiResponse({ status: 200, description: 'User updated successfully' })
  update(
    @Param('id') id: string,
    @Body() updateData: UpdateUserDto,
    @CurrentUser() user: CurrentUserData,
  ) {
    const esAdmin = this.esAdministracion(user);

    if (user.userId !== id && !esAdmin) {
      throw new ForbiddenException('Solo puedes editar tu propio perfil');
    }

    // Rol y estado son atribuciones de la administracion, no del propio
    // usuario: permitirlo era exactamente la via del autoascenso.
    if ((updateData.role !== undefined || updateData.isActive !== undefined) && !esAdmin) {
      throw new ForbiddenException(
        'Solo la administración puede cambiar el rol o el estado de una cuenta',
      );
    }

    // Un administrador de tenant no puede crear un SUPER_ADMIN: ese rol atraviesa
    // el aislamiento entre clientes.
    if (updateData.role === 'SUPER_ADMIN' && user.role !== 'SUPER_ADMIN') {
      throw new ForbiddenException('Solo un SUPER_ADMIN puede conceder ese rol');
    }

    return this.usersService.update(id, user.tenantId, updateData);
  }

  @Delete(':id')
  @Roles('TENANT_ADMIN', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Delete user (soft delete)' })
  @ApiResponse({ status: 200, description: 'User deleted successfully' })
  remove(@Param('id') id: string, @CurrentUser() user: CurrentUserData) {
    if (user.userId === id) {
      throw new ForbiddenException('No puedes desactivar tu propia cuenta');
    }
    return this.usersService.remove(id, user.tenantId);
  }
}
