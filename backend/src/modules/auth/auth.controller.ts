import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
  Headers,
  BadRequestException,
  ForbiddenException,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiHeader } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { UserRole } from '@prisma/client';
import { AuthService } from './auth.service';
import { LoginDto, LoginResponseDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  @ApiOperation({ summary: 'Login to tenant' })
  @ApiHeader({ name: 'X-Tenant-ID', description: 'Tenant ID', required: true })
  @ApiResponse({ status: 200, description: 'Login successful', type: LoginResponseDto })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  @ApiResponse({ status: 429, description: 'Too many login attempts' })
  // Sin limite, este endpoint admitia intentos ilimitados de contrasena: 10
  // por minuto y por IP bastan de sobra para un humano y arruinan la fuerza
  // bruta.
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @UseGuards(ThrottlerGuard, AuthGuard('local'))
  async login(@Request() req) {
    return this.authService.login(req.user);
  }

  @Post('register')
  @ApiOperation({ summary: 'Register new user in tenant' })
  @ApiHeader({ name: 'X-Tenant-ID', description: 'Tenant ID', required: true })
  @ApiResponse({ status: 201, description: 'User registered successfully', type: LoginResponseDto })
  @ApiResponse({ status: 409, description: 'User already exists' })
  @ApiResponse({ status: 429, description: 'Too many registration attempts' })
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @UseGuards(ThrottlerGuard)
  async register(
    @Body() registerDto: RegisterDto,
    @Headers('x-tenant-id') tenantId: string,
  ) {
    if (!tenantId) {
      throw new BadRequestException('Tenant ID is required');
    }

    // El rol venía en el cuerpo de una ruta PÚBLICA: bastaba enviar
    // {"role":"SUPER_ADMIN"} sin estar autenticado para crearse una cuenta con
    // ese rol, y SUPER_ADMIN es precisamente el que TenantGuard exime de la
    // comprobación de tenant. El alta pública solo puede crear alumnado; las
    // cuentas de docente y de administración se crean desde el panel, por
    // POST /students y POST /teachers, que sí exigen ser TENANT_ADMIN.
    if (registerDto.role && registerDto.role !== UserRole.STUDENT) {
      throw new ForbiddenException(
        'El registro público solo puede crear cuentas de estudiante',
      );
    }

    return this.authService.register(
      { ...registerDto, role: UserRole.STUDENT },
      tenantId,
    );
  }

  @Post('refresh')
  @ApiOperation({ summary: 'Refresh access token' })
  @ApiResponse({ status: 200, description: 'Token refreshed successfully' })
  @ApiResponse({ status: 401, description: 'Invalid refresh token' })
  async refresh(@Body('refreshToken') refreshToken: string) {
    return this.authService.refreshToken(refreshToken);
  }

  @Post('logout')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Logout user' })
  @ApiResponse({ status: 200, description: 'Logged out successfully' })
  @ApiResponse({ status: 401, description: 'Authentication required' })
  @HttpCode(HttpStatus.OK)
  // Antes no pedia token y no hacia nada: respondia "sesion cerrada" mientras
  // el refresh token seguia valido siete dias. Ahora exige saber quien cierra
  // sesion para poder invalidar sus tokens.
  @UseGuards(AuthGuard('jwt'))
  async logout(@Request() req) {
    return this.authService.logout(req.user.userId ?? req.user.id);
  }
}
