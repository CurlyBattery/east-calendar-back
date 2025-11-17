import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

export const UpdateTaskSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  start: z.coerce.date().optional(),
  end: z.coerce.date().optional(),
});

export class UpdateTaskDto extends createZodDto(UpdateTaskSchema) {}
