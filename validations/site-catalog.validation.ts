import { z } from "zod";

const pdfUrlSchema = z
  .string()
  .trim()
  .min(1, "PDF URL zorunludur")
  .max(2048)
  .refine(
    (s) => s.startsWith("http://") || s.startsWith("https://"),
    "URL http veya https ile başlamalıdır",
  );

export const siteCatalogCreateSchema = z.object({
  title: z.string().trim().min(1, "Başlık zorunludur").max(200),
  pdfUrl: pdfUrlSchema,
  sortOrder: z.coerce.number().int().min(0).max(999_999).optional().default(0),
});

export const siteCatalogUpdateSchema = siteCatalogCreateSchema;

export type SiteCatalogCreateInput = z.infer<typeof siteCatalogCreateSchema>;
export type SiteCatalogUpdateInput = z.infer<typeof siteCatalogUpdateSchema>;
