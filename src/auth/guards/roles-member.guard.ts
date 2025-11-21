import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { RoleMember } from '../../../generated/prisma';
import { ROLES_MEMBER_KEY } from '@app/common/decorators/roles-member.decorator';

@Injectable()
export class RolesMemberGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const requiredRolesMember = this.reflector.getAllAndOverride<RoleMember[]>(
      ROLES_MEMBER_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (!requiredRolesMember) {
      return true;
    }
  }
}
