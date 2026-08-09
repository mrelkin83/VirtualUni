import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '@/common/prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { User, UserRole } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  /**
   * Resuelve un identificador de tenant que puede venir como id o como
   * subdominio (las rutas de auth no pasan por TenantMiddleware).
   */
  async resolveTenantId(identifier: string): Promise<string | null> {
    const tenant = await this.prisma.tenant.findFirst({
      where: {
        OR: [{ id: identifier }, { subdomain: identifier.toLowerCase() }],
      },
      select: { id: true },
    });

    return tenant?.id ?? null;
  }

  async validateUser(email: string, password: string, tenantIdentifier: string): Promise<any> {
    const tenantId = await this.resolveTenantId(tenantIdentifier);

    if (!tenantId) {
      return null;
    }

    const user = await this.prisma.user.findFirst({
      where: {
        email,
        tenantId,
        isActive: true,
      },
      include: {
        tenant: true,
        student: true,
        teacher: true,
      },
    });

    if (!user) {
      return null;
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      return null;
    }

    // Update last login
    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    const { passwordHash, ...result } = user;
    return result;
  }

  async login(user: any) {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      tenantId: user.tenantId,
    };

    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRES_IN') || '7d',
    });

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        tenantId: user.tenantId,
        avatarUrl: user.avatarUrl,
      },
    };
  }

  async register(registerDto: RegisterDto, tenantIdentifier: string) {
    const tenantId = await this.resolveTenantId(tenantIdentifier);

    if (!tenantId) {
      throw new UnauthorizedException('Tenant not found');
    }

    // Check if user already exists
    const existingUser = await this.prisma.user.findFirst({
      where: {
        email: registerDto.email,
        tenantId,
      },
    });

    if (existingUser) {
      throw new ConflictException('User already exists');
    }

    // Verify tenant exists and is active
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
    });

    if (!tenant || tenant.status !== 'ACTIVE' && tenant.status !== 'TRIAL') {
      throw new UnauthorizedException('Tenant is not active');
    }

    // Enforce plan resource limits
    if (
      registerDto.role === UserRole.STUDENT &&
      tenant.maxStudents != null &&
      tenant.currentStudents >= tenant.maxStudents
    ) {
      throw new ForbiddenException('Student limit reached for the current plan');
    }
    if (
      registerDto.role === UserRole.TEACHER &&
      tenant.maxTeachers != null &&
      tenant.currentTeachers >= tenant.maxTeachers
    ) {
      throw new ForbiddenException('Teacher limit reached for the current plan');
    }

    // Hash password
    const passwordHash = await bcrypt.hash(registerDto.password, 10);

    // Create user
    const user = await this.prisma.user.create({
      data: {
        email: registerDto.email,
        passwordHash,
        firstName: registerDto.firstName,
        lastName: registerDto.lastName,
        role: registerDto.role,
        tenantId,
      },
    });

    // Create student or teacher profile based on role
    if (registerDto.role === UserRole.STUDENT) {
      const studentCode = `STU${Date.now()}`;
      await this.prisma.student.create({
        data: {
          userId: user.id,
          tenantId,
          studentCode,
          enrollmentDate: new Date(),
        },
      });

      // Update tenant student count
      await this.prisma.tenant.update({
        where: { id: tenantId },
        data: { currentStudents: { increment: 1 } },
      });
    } else if (registerDto.role === UserRole.TEACHER) {
      const employeeCode = `TCH${Date.now()}`;
      await this.prisma.teacher.create({
        data: {
          userId: user.id,
          tenantId,
          employeeCode,
          hireDate: new Date(),
        },
      });

      // Update tenant teacher count
      await this.prisma.tenant.update({
        where: { id: tenantId },
        data: { currentTeachers: { increment: 1 } },
      });
    }

    const { passwordHash: _, ...result } = user;
    return this.login(result);
  }

  /**
   * Cierra la sesion de verdad. Los JWT no se pueden retirar una vez emitidos,
   * asi que se marca el instante y se rechazan despues los refresh tokens
   * anteriores. Afecta a todos los dispositivos del usuario, que es el
   * comportamiento que se espera de quien cierra sesion porque sospecha que le
   * han robado el token.
   */
  async logout(userId: string) {
    await this.prisma.user.update({
      where: { id: userId },
      data: { sessionsRevokedAt: new Date() },
    });
    return { message: 'Logged out successfully' };
  }

  async refreshToken(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      });

      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
      });

      if (!user || !user.isActive) {
        throw new UnauthorizedException('User not found or inactive');
      }

      // `iat` solo tiene resolucion de segundos, asi que un token emitido a las
      // 12:00:00.100 y un cierre de sesion a las 12:00:00.779 son
      // indistinguibles. Se redondea el cierre al segundo siguiente para que la
      // duda se resuelva rechazando: dejar pasar el token del mismo segundo era
      // precisamente el hueco que detecto la primera prueba. El coste es que un
      // inicio de sesion en ese mismo segundo tampoco podra refrescar, algo que
      // se corrige solo al segundo siguiente.
      if (
        user.sessionsRevokedAt &&
        payload.iat < Math.ceil(user.sessionsRevokedAt.getTime() / 1000)
      ) {
        throw new UnauthorizedException('Session was closed');
      }

      const newPayload = {
        sub: user.id,
        email: user.email,
        role: user.role,
        tenantId: user.tenantId,
      };

      const accessToken = this.jwtService.sign(newPayload);

      return {
        accessToken,
        refreshToken,
      };
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }
}
