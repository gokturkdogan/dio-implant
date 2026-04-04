import { z } from "zod";

function httpUrlOrEmpty(val: string): boolean {
  if (!val) return true;
  return val.startsWith("http://") || val.startsWith("https://");
}

export const siteContactUpsertSchema = z.object({
  companyName: z.string().trim().max(300).default(""),
  centerLabel: z.string().trim().max(200).default(""),
  address: z.string().trim().max(500).default(""),
  phone: z.string().trim().max(80).default(""),
  email: z.string().trim().max(200).default(""),
  hours: z.string().trim().max(500).default(""),
  mapDirectionsUrl: z
    .string()
    .trim()
    .max(2048)
    .default("")
    .refine(httpUrlOrEmpty, "Yol tarifi linki http(s) ile başlamalıdır."),
  mapEmbedUrl: z
    .string()
    .trim()
    .max(2048)
    .default("")
    .refine(httpUrlOrEmpty, "Harita embed URL’si http(s) ile başlamalıdır."),
});

export type SiteContactUpsertInput = z.infer<typeof siteContactUpsertSchema>;

export const regionalOfficeCreateSchema = z.object({
  sortOrder: z.number().int().min(0).max(99999).optional(),
  name: z.string().trim().min(1, "Ofis adı gerekli").max(200),
  coverage: z.string().trim().min(1, "Hizmet alanı gerekli").max(2000),
  phone: z.string().trim().min(1, "Telefon gerekli").max(80),
  email: z.string().trim().min(1, "E-posta gerekli").max(200),
  address: z.string().trim().min(1, "Adres gerekli").max(500),
  mapDirectionsUrl: z
    .string()
    .trim()
    .max(2048)
    .default("")
    .refine(httpUrlOrEmpty, "Yol tarifi linki http(s) ile başlamalıdır."),
});

export const regionalOfficeUpdateSchema = regionalOfficeCreateSchema;

export type RegionalOfficeCreateInput = z.infer<typeof regionalOfficeCreateSchema>;
export type RegionalOfficeUpdateInput = z.infer<typeof regionalOfficeUpdateSchema>;

export const authorizedDealerCreateSchema = z.object({
  sortOrder: z.number().int().min(0).max(99999).optional(),
  name: z.string().trim().min(1, "Bayi adı gerekli").max(200),
  serviceRegion: z.string().trim().min(1, "Sorumlu bölge gerekli").max(2000),
  contactPerson: z.string().trim().max(120).default(""),
  phone: z.string().trim().min(1, "Telefon gerekli").max(80),
  website: z
    .string()
    .trim()
    .max(2048)
    .default("")
    .refine((v) => !v || httpUrlOrEmpty(v), "Web adresi http(s) ile başlamalıdır."),
});

export const authorizedDealerUpdateSchema = authorizedDealerCreateSchema;

export type AuthorizedDealerCreateInput = z.infer<typeof authorizedDealerCreateSchema>;
export type AuthorizedDealerUpdateInput = z.infer<typeof authorizedDealerUpdateSchema>;
