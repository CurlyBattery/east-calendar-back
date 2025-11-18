import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';
import { SubscriptionPlan } from '../../../generated/prisma';

export const UpdateUserSchema = z.object({
  email: z.string().optional(),
  name: z.string().optional(),
  avatarUrl: z.string().optional(),
  plan: z.enum(SubscriptionPlan).default(SubscriptionPlan.FREE).optional(),
});

export class UpdateUserDto extends createZodDto(UpdateUserSchema) {}
