import { z } from "zod";
import {
  ADMIN_NEW_PASSWORD_MAX_LENGTH,
  ADMIN_NEW_PASSWORD_MIN_LENGTH,
  createAdminNewPasswordZodSchema,
} from "@/lib/admin-password-requirements";

export { ADMIN_NEW_PASSWORD_MIN_LENGTH, ADMIN_NEW_PASSWORD_MAX_LENGTH };

export const adminNewPasswordFieldSchema = createAdminNewPasswordZodSchema();

const adminNewPasswordPairBaseSchema = z.object({
  newPassword: adminNewPasswordFieldSchema,
  confirmPassword: z
    .string()
    .min(1, "Parola tekrarı gerekli")
    .max(ADMIN_NEW_PASSWORD_MAX_LENGTH),
});

export const adminNewPasswordPairSchema = adminNewPasswordPairBaseSchema.refine(
  (d) => d.newPassword === d.confirmPassword,
  {
    message: "Parolalar eşleşmiyor",
    path: ["confirmPassword"],
  },
);

export function firstZodIssueMessage(
  error: z.ZodError,
  field?: keyof z.infer<typeof adminNewPasswordPairBaseSchema> | "token",
): string {
  if (field) {
    const issue = error.issues.find((i) => i.path[0] === field);
    if (issue?.message) return issue.message;
  }
  return error.issues[0]?.message ?? "Geçersiz giriş";
}

export const adminLoginSchema = z.object({
  username: z.string().trim().min(1).max(64),
  password: z.string().min(1).max(256),
});

export type AdminLoginInput = z.infer<typeof adminLoginSchema>;

export const adminForgotPasswordSchema = z.object({
  username: z.string().trim().min(1, "Kullanıcı adı gerekli").max(64),
  email: z.string().trim().email("Geçerli bir e-posta girin").max(200),
});

export type AdminForgotPasswordInput = z.infer<typeof adminForgotPasswordSchema>;

export const adminResetPasswordSchema = adminNewPasswordPairBaseSchema
  .extend({
    token: z.string().trim().min(1, "Geçersiz sıfırlama bağlantısı"),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: "Parolalar eşleşmiyor",
    path: ["confirmPassword"],
  });

export type AdminResetPasswordInput = z.infer<typeof adminResetPasswordSchema>;

export const adminAccountProfileSchema = z.object({
  firstName: z.string().trim().min(1, "Ad gerekli").max(80),
  lastName: z.string().trim().min(1, "Soyad gerekli").max(80),
});

export type AdminAccountProfileInput = z.infer<typeof adminAccountProfileSchema>;

export const adminAccountPasswordSchema = adminNewPasswordPairBaseSchema
  .extend({
    currentPassword: z
      .string()
      .min(1, "Mevcut parola gerekli")
      .max(ADMIN_NEW_PASSWORD_MAX_LENGTH),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: "Parolalar eşleşmiyor",
    path: ["confirmPassword"],
  });

export type AdminAccountPasswordInput = z.infer<typeof adminAccountPasswordSchema>;

