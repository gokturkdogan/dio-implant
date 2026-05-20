import { z } from "zod";

export const adminLoginSchema = z.object({
  username: z.string().trim().min(1).max(64),
  password: z.string().min(1).max(256),
});

export type AdminLoginInput = z.infer<typeof adminLoginSchema>;

export const adminAccountProfileSchema = z.object({
  firstName: z.string().trim().min(1, "Ad gerekli").max(80),
  lastName: z.string().trim().min(1, "Soyad gerekli").max(80),
});

export type AdminAccountProfileInput = z.infer<typeof adminAccountProfileSchema>;

export const adminAccountPasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Mevcut parola gerekli").max(256),
    newPassword: z
      .string()
      .min(8, "Yeni parola en az 8 karakter olmalı")
      .max(256),
    confirmPassword: z.string().min(1, "Parola tekrarı gerekli").max(256),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: "Parolalar eşleşmiyor",
    path: ["confirmPassword"],
  });

export type AdminAccountPasswordInput = z.infer<typeof adminAccountPasswordSchema>;

