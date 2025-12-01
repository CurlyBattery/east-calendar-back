import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

const passwordValidation = new RegExp(
  /^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[#?!@$%^&*-])/,
);

export const RegisterSchema = z
  .object({
    email: z.string(),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(passwordValidation, {
        message:
          'You password must be contain uppercase and lowercase letters, special characters and numbers.',
      }),
    confirmPassword: z.string().min(8, 'Please enter confirm password'),
    name: z.string(),
    avatarPath: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.confirmPassword !== data.password) {
      ctx.addIssue({
        code: 'custom',
        message: 'Password do not match',
        path: ['confirmPassword'],
      });
    }
  });

export class RegisterDto extends createZodDto(RegisterSchema) {}
