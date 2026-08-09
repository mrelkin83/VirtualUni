import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  SetMetadata,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '../prisma/prisma.service';

export type FeatureType = 'messaging' | 'videoConf' | 'payments' | 'certificates';

export const FEATURE_KEY = 'feature';
export const RequireFeature = (feature: FeatureType) =>
  SetMetadata(FEATURE_KEY, feature);

@Injectable()
export class FeatureGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredFeature = this.reflector.getAllAndOverride<FeatureType>(
      FEATURE_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredFeature) {
      return true; // No feature check required
    }

    const request = context.switchToHttp().getRequest();
    const tenantId = request.tenantId || request.tenant?.id;

    if (!tenantId) {
      return true; // Let other guards handle tenant validation
    }

    // Get tenant with feature flags
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
      select: {
        enableMessaging: true,
        enableVideoConf: true,
        enablePayments: true,
        enableCertificates: true,
        plan: true,
      },
    });

    if (!tenant) {
      return true; // Let other guards handle tenant not found
    }

    // Check if feature is enabled
    let featureEnabled = false;
    let featureName = '';

    switch (requiredFeature) {
      case 'messaging':
        featureEnabled = tenant.enableMessaging;
        featureName = 'Messaging';
        break;
      case 'videoConf':
        featureEnabled = tenant.enableVideoConf;
        featureName = 'Video Conferencing';
        break;
      case 'payments':
        featureEnabled = tenant.enablePayments;
        featureName = 'Payments';
        break;
      case 'certificates':
        featureEnabled = tenant.enableCertificates;
        featureName = 'Certificates';
        break;
    }

    if (!featureEnabled) {
      throw new ForbiddenException(
        `${featureName} feature is not available in your current plan (${tenant.plan}). ` +
        `Please upgrade to access this feature.`,
      );
    }

    return true;
  }
}
