import { z } from "zod";

const optionalHttpsUrl = z.preprocess(
  (v) => {
    if (v == null || v === "") return undefined;
    const t = String(v).trim();
    return t === "" ? undefined : t;
  },
  z.string().url().optional(),
);

/** PUT: boş string → değiştirme, null → alanı temizle */
const optionalHttpsUrlNullable = z.preprocess(
  (v) => {
    if (v === null) return null;
    if (v === undefined) return undefined;
    const t = String(v).trim();
    return t === "" ? undefined : t;
  },
  z.union([z.string().url(), z.null()]).optional(),
);

const posterItemSchema = z.object({
  title: z.string().trim().min(1).max(120),
  url: z.string().url(),
});

const normalizePosterPayload = (v: unknown): unknown => {
  if (!Array.isArray(v)) return undefined;
  return v
    .map((item, idx) => {
      if (typeof item === "string") {
        const url = item.trim();
        if (!url) return null;
        return { title: `Afiş ${idx + 1}`, url };
      }
      if (item && typeof item === "object") {
        const titleRaw = (item as { title?: unknown }).title;
        const urlRaw = (item as { url?: unknown }).url;
        const title = String(titleRaw ?? "").trim();
        const url = String(urlRaw ?? "").trim();
        if (!title || !url) return null;
        return { title, url };
      }
      return null;
    })
    .filter(Boolean);
};

const posterUrlsField = z.preprocess(
  (v) => (v == null ? undefined : normalizePosterPayload(v)),
  z.array(posterItemSchema).max(40).optional(),
);

/** PUT: null → boş dizi; dizi → değiştir */
const posterUrlsUpdateSchema = z.preprocess(
  (v) => {
    if (v === null) return null;
    if (v === undefined) return undefined;
    return normalizePosterPayload(v);
  },
  z.union([z.array(posterItemSchema).max(40), z.null()]).optional(),
);

export const productIdSchema = z.coerce.number().int().positive();

export const createProductSchema = z.object({
  name: z.string().trim().min(1, "Product name is required").max(160),
  excerpt: z.string().trim().max(800).optional().nullable(),
  description: z.string().trim().max(50_000).optional().nullable(),
  posterUrls: posterUrlsField,
  imageUrl: optionalHttpsUrl,
  categoryId: z.coerce.number().int().positive(),
});

export const updateProductSchema = z
  .object({
    name: z.string().trim().min(1).max(160).optional(),
    excerpt: z.string().trim().max(800).optional().nullable(),
    description: z.string().trim().max(50_000).optional().nullable(),
    posterUrls: posterUrlsUpdateSchema,
    imageUrl: optionalHttpsUrlNullable,
    categoryId: z.coerce.number().int().positive().optional(),
  })
  .refine(
    (data) =>
      data.name !== undefined ||
      data.excerpt !== undefined ||
      data.description !== undefined ||
      data.posterUrls !== undefined ||
      data.imageUrl !== undefined ||
      data.categoryId !== undefined,
    { message: "Güncelleme için en az bir alan gerekli" },
  );

export const productQuerySchema = z.object({
  categorySlug: z.string().trim().min(1).optional(),
});

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type ProductQueryInput = z.infer<typeof productQuerySchema>;
