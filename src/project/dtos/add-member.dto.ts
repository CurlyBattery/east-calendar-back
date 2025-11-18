import { z } from 'zod';
import { RoleMember } from '../../../generated/prisma';
import { createZodDto } from 'nestjs-zod';

export const AddMemberSchema = z.object({
  userId: z.string(),
  role: z.enum(RoleMember).default(RoleMember.MEMBER),
});

export class AddMemberDto extends createZodDto(AddMemberSchema) {}
