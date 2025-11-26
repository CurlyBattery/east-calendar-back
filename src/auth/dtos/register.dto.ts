import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

export const RegisterSchema = z.object({
  email: z.string(),
  password: z.string(),
  name: z.string(),
  avatarPath: z.string().optional(),
});

export class RegisterDto extends createZodDto(RegisterSchema) {}
