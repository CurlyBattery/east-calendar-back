import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

export const UpdateUserSchema = z.object({
  email: z.string().optional(),
  name: z.string().optional(),
  avatarPath: z.string().optional(),
});

export class UpdateUserDto extends createZodDto(UpdateUserSchema) {}
