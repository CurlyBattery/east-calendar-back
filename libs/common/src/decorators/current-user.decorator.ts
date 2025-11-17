import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { RequestWithUser } from '../../../../src/auth/types';

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const req: RequestWithUser = ctx.switchToHttp().getRequest();
    return req.user;
  },
);
