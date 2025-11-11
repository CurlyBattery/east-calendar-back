import { z } from 'zod';

export const envSchema = z.object({
  DATABASE_URL: z.string(),
  PORT: z.coerce.number().optional().default(3000),
  ACCESS_SECRET: z.string(),
  ACCESS_EXP: z.string(),
  REFRESH_EXP: z.string(),
});

export type Env = z.infer<typeof envSchema>;
