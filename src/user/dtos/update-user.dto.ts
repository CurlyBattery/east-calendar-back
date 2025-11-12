import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

export const UpdateUserSchema = z.object({
  email: z.string(),
  name: z.string(),
  avatarUrl: z.string(),
});

export class UpdateUserDto extends createZodDto(UpdateUserSchema) {}
