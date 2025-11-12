import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const Cookie = createParamDecorator(
  (key: string, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();

    if (!request || !request.cookies) return null;

    return key && key in request.cookies
      ? request.cookies[key]
      : key
        ? null
        : request.cookies;
  },
);
