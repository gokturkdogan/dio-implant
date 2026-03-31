import { z } from "zod";

export const categoryIdSchema = z.coerce.number().int().positive();

const parentIdField = z
  .union([z.number().int().positive(), z.null()])
  .optional();

const optionalHttpsUrl = z.preprocess(
  (v) => {
    if (v == null || v === "") return undefined;
    const t = String(v).trim();
    return t === "" ? undefined : t;
  },
  z.string().url().optional(),
);

const optionalHttpsUrlNullable = z.preprocess(
  (v) => {
    if (v === null) return null;
    if (v === undefined) return undefined;
    const t = String(v).trim();
    return t === "" ? null : t;
  },
  z.union([z.string().url(), z.null()]).optional(),
);

export const createCategorySchema = z.object({
  name: z.string().trim().min(1, "Category name is required").max(120),
  /** Üst kategori yoksa veya null ise kök kategori */
  parentId: parentIdField,
  imageUrl: optionalHttpsUrl,
});

export const updateCategorySchema = z
  .object({
    name: z.string().trim().min(1).max(120).optional(),
    /**
     * Üst kategori. `null`: kök kategoriye taşı.
     * `undefined`: üst kategoriyi değiştirme.
     */
    parentId: parentIdField,
    imageUrl: optionalHttpsUrlNullable,
  })
  .refine(
    (data) =>
      data.name !== undefined ||
      data.parentId !== undefined ||
      data.imageUrl !== undefined,
    {
      message: "Güncelleme için en az ad, üst kategori veya görsel alanından biri gerekli",
    },
  );

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
