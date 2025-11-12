import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

export const RegisterSchema = z.object({
  email: z.string(),
  password: z.string(),
  name: z.string(),
  avatarUrl: z.string(),
});

export class RegisterDto extends createZodDto(RegisterSchema) {}
