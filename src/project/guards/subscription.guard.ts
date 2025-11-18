import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';
import { RequestWithUser } from '../../auth/types';
import { SubscriptionPlan } from '../../../generated/prisma';

@Injectable()
export class SubscriptionGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request: RequestWithUser = context.switchToHttp().getRequest();

    return request.user.plan === SubscriptionPlan.PRO;
  }
}
