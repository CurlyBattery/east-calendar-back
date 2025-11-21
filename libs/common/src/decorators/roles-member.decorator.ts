import { SetMetadata } from '@nestjs/common';
import { RoleMember } from '../../../../generated/prisma';

export const ROLES_MEMBER_KEY = 'roles-member';
export const RolesMember = (...roles: RoleMember[]) =>
  SetMetadata(ROLES_MEMBER_KEY, roles);
