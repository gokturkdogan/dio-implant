import { z } from "zod";

export const contactInquirySchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "E-posta adresi gerekli")
    .email("Geçerli bir e-posta adresi girin")
    .max(254),
  message: z
    .string()
    .trim()
    .min(10, "Mesaj en az 10 karakter olmalıdır")
    .max(5000, "Mesaj en fazla 5000 karakter olabilir"),
  /** Honeypot — doluysa bot; API sessizce başarı döner */
  website: z.string().optional(),
});

export type ContactInquiryInput = z.infer<typeof contactInquirySchema>;
