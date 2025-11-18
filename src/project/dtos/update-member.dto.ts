import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';
import { RoleMember } from '../../../generated/prisma';

export const UpdateMemberSchema = z.object({
  memberId: z.string(),
  role: z.enum(RoleMember).default(RoleMember.MEMBER),
});

export class UpdateMemberDto extends createZodDto(UpdateMemberSchema) {}
