import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

export const LogoutSchema = z.object({
  userAgent: z.string(),
});

export class LogoutDto extends createZodDto(LogoutSchema) {}
