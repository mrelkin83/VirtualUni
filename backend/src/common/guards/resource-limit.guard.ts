import {
  Injectable,
  CanActivate,
  ExecutionContext,
  BadRequestException,
  SetMetadata,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '../prisma/prisma.service';

export type ResourceType = 'students' | 'teachers' | 'courses';

export const RESOURCE_LIMIT_KEY = 'resourceLimit';
export const ResourceLimit = (type: ResourceType) =>
  SetMetadata(RESOURCE_LIMIT_KEY, type);

@Injectable()
export class ResourceLimitGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const resourceType = this.reflector.getAllAndOverride<ResourceType>(
      RESOURCE_LIMIT_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!resourceType) {
      return true; // No resource limit check required
    }

    const request = context.switchToHttp().getRequest();
    const tenantId = request.tenantId || request.tenant?.id;

    if (!tenantId) {
      throw new BadRequestException('Tenant ID not found');
    }

    // Get tenant with current usage
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
    });

    if (!tenant) {
      throw new BadRequestException('Tenant not found');
    }

    // Check limits based on resource type
    let currentUsage: number;
    let limit: number;

    switch (resourceType) {
      case 'students':
        currentUsage = tenant.currentStudents;
        limit = tenant.maxStudents;
        break;
      case 'teachers':
        currentUsage = tenant.currentTeachers;
        limit = tenant.maxTeachers;
        break;
      case 'courses':
        currentUsage = tenant.currentCourses;
        limit = tenant.maxCourses;
        break;
      default:
        return true;
    }

    if (currentUsage >= limit) {
      throw new BadRequestException(
        `${resourceType.charAt(0).toUpperCase() + resourceType.slice(1)} limit reached. ` +
        `Current plan (${tenant.plan}) allows ${limit} ${resourceType}. ` +
        `Please upgrade your plan to add more.`,
      );
    }

    return true;
  }
}
