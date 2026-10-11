import { z } from 'zod';

export const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/;
export const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const registerSchema = z.object({
  email: z.string().email('Please enter a valid email address.'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(passwordRegex, 'Password must include uppercase, lowercase, a number, and a special character'),
  confirmPassword: z.string(),
  fullName: z.string().min(2, 'Full name is required'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address.'),
  password: z.string().min(1, 'Password is required'),
});

export const createTenantSchema = z.object({
  name: z.string().min(4, 'Tenant name must be at least 4 characters'),
  slug: z.string()
    .min(1, 'Slug is required')
    .regex(slugRegex, 'Slug must be lowercase and contain only letters, numbers, and hyphens, and cannot start or end with a hyphen'),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type CreateTenantInput = z.infer<typeof createTenantSchema>;
