import { z } from 'zod';
import { RoleMember } from '../../../generated/prisma';
import { createZodDto } from 'nestjs-zod';

export const DeleteMemberSchema = z.object({
  memberId: z.string(),
});

export class DeleteMemberDto extends createZodDto(DeleteMemberSchema) {}
