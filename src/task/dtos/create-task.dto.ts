import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';
import { TaskPriority } from '../../../generated/prisma';

export const CreateTaskSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
  start: z.coerce.date(),
  end: z.coerce.date(),
  projectId: z.string(),
  priority: z.enum(TaskPriority),
  assigneeId: z.string().optional(),
});

export class CreateTaskDto extends createZodDto(CreateTaskSchema) {}
