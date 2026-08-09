import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export interface CurrentUserData {
  userId: string;
  tenantId: string;
  email: string;
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
