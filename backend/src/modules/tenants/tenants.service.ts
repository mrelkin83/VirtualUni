import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '@/common/prisma/prisma.service';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { UpdateTenantDto } from './dto/update-tenant.dto';
import { Plan, TenantStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';

@Injectable()
export class TenantsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Create a new tenant with admin user
   */
  async create(createTenantDto: CreateTenantDto) {
    // Check if slug or subdomain already exists
    const existingTenant = await this.prisma.tenant.findFirst({
      where: {
        OR: [
          { slug: createTenantDto.slug },
          { subdomain: createTenantDto.slug },
        ],
      },
    });

    if (existingTenant) {
      throw new ConflictException('Tenant slug/subdomain already exists');
    }

    // Check if admin email already exists globally
    const existingAdmin = await this.prisma.user.findFirst({
      where: { email: createTenantDto.adminEmail },
    });

    if (existingAdmin) {
      throw new ConflictException('Admin email already exists');
    }

    // Calculate trial end date (14 days from now)
    const trialEndsAt = new Date();
    trialEndsAt.setDate(trialEndsAt.getDate() + 14);

    // Get plan limits
    const planLimits = this.getPlanLimits(createTenantDto.plan || Plan.FREE);

    // Create tenant with transaction
    const tenant = await this.prisma.$transaction(async (tx) => {
      // Create tenant
      const newTenant = await tx.tenant.create({
        data: {
          name: createTenantDto.name,
          slug: createTenantDto.slug,
          subdomain: createTenantDto.slug,
          plan: createTenantDto.plan || Plan.FREE,
          status: TenantStatus.TRIAL,
          trialEndsAt,
          ...planLimits,
        },
      });

      // Hash admin password
      const passwordHash = await bcrypt.hash(createTenantDto.adminPassword, 10);

      // Create admin user
      const adminUser = await tx.user.create({
        data: {
          email: createTenantDto.adminEmail,
          passwordHash,
          firstName: createTenantDto.adminFirstName,
          lastName: createTenantDto.adminLastName,
          role: 'TENANT_ADMIN',
          tenantId: newTenant.id,
        },
      });

      return { ...newTenant, adminUser };
    });

    return tenant;
  }

  /**
   * Find all tenants with pagination
   */
  async findAll(page = 1, limit = 10, status?: TenantStatus) {
    const skip = (page - 1) * limit;

    const where = status ? { status } : {};

    const [tenants, total] = await Promise.all([
      this.prisma.tenant.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          _count: {
            select: {
              users: true,
              subscriptions: true,
              invoices: true,
            },
          },
        },
      }),
      this.prisma.tenant.count({ where }),
    ]);

    return {
      data: tenants,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Find one tenant by ID or slug
   */
  async findOne(identifier: string) {
    const tenant = await this.prisma.tenant.findFirst({
      where: {
        OR: [{ id: identifier }, { slug: identifier }],
      },
      include: {
        subscriptions: {
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
        invoices: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        _count: {
          select: {
            users: true,
            subscriptions: true,
            invoices: true,
          },
        },
      },
    });

    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }

    return tenant;
  }

  /**
   * Find tenant by subdomain (public endpoint)
   */
  async findBySubdomain(subdomain: string) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { subdomain },
      select: {
        id: true,
        slug: true,
        name: true,
        subdomain: true,
        plan: true,
        status: true,
        logo: true,
        primaryColor: true,
        secondaryColor: true,
        enableMessaging: true,
        enableVideoConf: true,
        enablePayments: true,
        enableCertificates: true,
        // Los cupos (maxStudents/maxTeachers/maxCourses) y el uso real
        // (currentStudents/currentTeachers/currentCourses) NO se devuelven
        // aqui: este endpoint es publico, se resuelve antes del login y solo
        // necesita la identidad visual y los modulos activos para pintar la
        // pantalla de acceso. Incluirlos permitia a cualquiera que conociera
        // un subdominio saber cuantos alumnos y profesores tiene esa
        // institucion. Las rutas autenticadas de tenants si los exponen.
      },
    });

    if (!tenant) {
      throw new NotFoundException(`Tenant with subdomain '${subdomain}' not found`);
    }

    return tenant;
  }

  /**
   * Update tenant settings
   */
  async update(id: string, updateTenantDto: UpdateTenantDto) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id },
    });

    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }

    // If changing plan, update limits
    let planLimits = {};
    if (updateTenantDto.plan && updateTenantDto.plan !== tenant.plan) {
      planLimits = this.getPlanLimits(updateTenantDto.plan);
    }

    const updated = await this.prisma.tenant.update({
      where: { id },
      data: {
        ...updateTenantDto,
        ...planLimits,
      },
    });

    return updated;
  }

  /**
   * Update tenant status
   */
  async updateStatus(id: string, status: TenantStatus) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id },
    });

    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }

    return this.prisma.tenant.update({
      where: { id },
      data: { status },
    });
  }

  /**
   * Soft delete tenant
   */
  async remove(id: string) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id },
    });

    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }

    return this.prisma.tenant.update({
      where: { id },
      data: {
        status: TenantStatus.CANCELLED,
        deletedAt: new Date(),
      },
    });
  }

  /**
   * Get tenant usage statistics
   */
  async getUsageStats(tenantId: string) {
    const tenant = await this.findOne(tenantId);

    const usage = {
      students: {
        current: tenant.currentStudents,
        limit: tenant.maxStudents,
        percentage: (tenant.currentStudents / tenant.maxStudents) * 100,
      },
      teachers: {
        current: tenant.currentTeachers,
        limit: tenant.maxTeachers,
        percentage: (tenant.currentTeachers / tenant.maxTeachers) * 100,
      },
      courses: {
        current: tenant.currentCourses,
        limit: tenant.maxCourses,
        percentage: (tenant.currentCourses / tenant.maxCourses) * 100,
      },
      storage: {
        current: tenant.currentStorageGB,
        limit: tenant.storageGB,
        percentage: (tenant.currentStorageGB / tenant.storageGB) * 100,
      },
    };

    return usage;
  }

  /**
   * Check if tenant can add more resources
   */
  async canAddResource(
    tenantId: string,
    resourceType: 'students' | 'teachers' | 'courses',
  ): Promise<boolean> {
    const tenant = await this.findOne(tenantId);

    switch (resourceType) {
      case 'students':
        return tenant.currentStudents < tenant.maxStudents;
      case 'teachers':
        return tenant.currentTeachers < tenant.maxTeachers;
      case 'courses':
        return tenant.currentCourses < tenant.maxCourses;
      default:
        return false;
    }
  }

  /**
   * Increment resource usage
   */
  async incrementUsage(
    tenantId: string,
    resourceType: 'students' | 'teachers' | 'courses',
  ) {
    const canAdd = await this.canAddResource(tenantId, resourceType);

    if (!canAdd) {
      throw new BadRequestException(
        `Tenant has reached the limit for ${resourceType}`,
      );
    }

    const field = `current${resourceType.charAt(0).toUpperCase() + resourceType.slice(1)}`;

    return this.prisma.tenant.update({
      where: { id: tenantId },
      data: {
        [field]: { increment: 1 },
      },
    });
  }

  /**
   * Decrement resource usage
   */
  async decrementUsage(
    tenantId: string,
    resourceType: 'students' | 'teachers' | 'courses',
  ) {
    const field = `current${resourceType.charAt(0).toUpperCase() + resourceType.slice(1)}`;

    return this.prisma.tenant.update({
      where: { id: tenantId },
      data: {
        [field]: { decrement: 1 },
      },
    });
  }

  /**
   * Get plan limits configuration
   */
  private getPlanLimits(plan: Plan) {
    const limits = {
      [Plan.FREE]: {
        maxStudents: 20,
        maxTeachers: 2,
        maxCourses: 5,
        storageGB: 1,
        enableMessaging: true,
        enableVideoConf: false,
        enablePayments: false,
        enableCertificates: false,
      },
      [Plan.BASIC]: {
        maxStudents: 100,
        maxTeachers: 10,
        maxCourses: 20,
        storageGB: 10,
        enableMessaging: true,
        enableVideoConf: true,
        enablePayments: false,
        enableCertificates: true,
      },
      [Plan.PROFESSIONAL]: {
        maxStudents: 500,
        maxTeachers: 50,
        maxCourses: 100,
        storageGB: 50,
        enableMessaging: true,
        enableVideoConf: true,
        enablePayments: true,
        enableCertificates: true,
      },
      [Plan.ENTERPRISE]: {
        maxStudents: 999999,
        maxTeachers: 999999,
        maxCourses: 999999,
        storageGB: 500,
        enableMessaging: true,
        enableVideoConf: true,
        enablePayments: true,
        enableCertificates: true,
      },
    };

    return limits[plan];
  }
}
