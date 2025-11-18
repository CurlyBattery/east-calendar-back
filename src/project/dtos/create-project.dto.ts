import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

export const CreateProjectSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
});

export class CreateProjectDto extends createZodDto(CreateProjectSchema) {}
