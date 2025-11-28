import { Request } from 'express';

import { IsSubscriptionPlan, User } from '../../../generated/prisma';

export interface Tokens {
  accessToken: string;
  refreshToken: string;
}

export interface JwtPayload {
  sub: string;
  email: string;
}

export interface RequestWithUser extends Request {
  user: User & {
    plan: IsSubscriptionPlan;
  };
}
