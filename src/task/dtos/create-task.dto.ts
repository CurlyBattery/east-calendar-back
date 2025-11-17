import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

export const CreateTaskSchema = z.object({
  title: z.string(),
  description: z.string(),
  start: z.coerce.date(),
  end: z.coerce.date(),
});

export class CreateTaskDto extends createZodDto(CreateTaskSchema) {}
