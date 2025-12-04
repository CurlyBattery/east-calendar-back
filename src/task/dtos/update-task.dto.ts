import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';
import { TaskStatus } from '../../../generated/prisma';

export const UpdateTaskSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  status: z.enum(TaskStatus).optional(),
  start: z.coerce.date().optional(),
  end: z.coerce.date().optional(),
  assigneeId: z.string().optional(),
});

export class UpdateTaskDto extends createZodDto(UpdateTaskSchema) {}
