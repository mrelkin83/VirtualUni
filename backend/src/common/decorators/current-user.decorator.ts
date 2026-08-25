import { createParamDecorator, ExecutionContext } from '@nestjs/common';

// Debe reflejar exactamente lo que devuelve JwtStrategy.validate()
// (backend/src/modules/auth/strategies/jwt.strategy.ts).
export interface CurrentUserData {
  id: string;
  userId: string;
  tenantId: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}

export const CurrentUser = createParamDecorator(
  (
    data: keyof CurrentUserData | undefined,
    ctx: ExecutionContext,
  ): CurrentUserData | CurrentUserData[keyof CurrentUserData] => {
    const request = ctx.switchToHttp().getRequest();
    const user: CurrentUserData | undefined = request.user;
    return data && user ? user[data] : user;
  },
);
