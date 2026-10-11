import { z } from "zod";

export const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const registerSchema = z
  .object({
    fullName: z
      .string()
      .trim()
      .min(2, "Full Name must be at least 2 characters long.")
      .max(100, "Full Name cannot exceed 100 characters."),
    email: z
      .string()
      .trim()
      .min(1, "Email address is required.")
      .regex(emailRegex, "Please enter a valid email address (e.g. user@example.com)."),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters long.")
      .regex(/[A-Za-z]/, "Password must contain at least one letter.")
      .regex(/[0-9]|[^a-zA-Z0-9]/, "Password must contain at least one number or symbol."),
    confirmPassword: z.string().min(1, "Please confirm your password."),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Email address is required.")
    .regex(emailRegex, "Please enter a valid email address."),
  password: z.string().min(1, "Password is required."),
});

export const createTenantSchema = z.object({
  name: z
    .string()
    .trim()
    .min(3, "Organization name must be at least 3 characters.")
    .max(80, "Organization name cannot exceed 80 characters."),
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .min(3, "Slug must be at least 3 characters.")
    .max(50, "Slug cannot exceed 50 characters.")
    .regex(
      slugRegex,
      "Slug can only contain lowercase letters, numbers, and single hyphens (e.g. 'acme-corp').",
    ),
});

export const createTraySchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Tray name must be at least 2 characters.")
    .max(60, "Tray name cannot exceed 60 characters."),
});

export const createFolderSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Folder name cannot be empty.")
    .max(100, "Folder name cannot exceed 100 characters.")
    .refine((val) => !val.includes("/") && !val.includes("\\"), {
      message: "Folder name cannot contain slashes ('/' or '\\').",
    }),
});

export const rejectIntakeSchema = z.object({
  reason: z
    .string()
    .trim()
    .min(3, "Rejection reason must be at least 3 characters long.")
    .max(500, "Rejection reason cannot exceed 500 characters."),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type CreateTenantInput = z.infer<typeof createTenantSchema>;
