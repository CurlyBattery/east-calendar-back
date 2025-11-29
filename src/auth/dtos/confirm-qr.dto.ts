import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';
import { QrStatus } from '../../../generated/prisma';

export const ConfirmQrSchema = z.object({
  sessionId: z.string(),
  status: z.enum(QrStatus),
});

export class ConfirmQrDto extends createZodDto(ConfirmQrSchema) {}
