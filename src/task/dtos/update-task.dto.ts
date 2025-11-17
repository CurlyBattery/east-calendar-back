import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

export const UpdateTaskSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  start: z.date().optional(),
  end: z.date().optional(),
});

export class UpdateTaskDto extends createZodDto(UpdateTaskSchema) {}
