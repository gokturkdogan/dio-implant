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
    /** Aynı üst (veya kök) içinde sıra; menü ve katalog */
    sortOrder: z.number().int().min(0).optional(),
  })
  .refine(
    (data) =>
      data.name !== undefined ||
      data.parentId !== undefined ||
      data.imageUrl !== undefined ||
      data.sortOrder !== undefined,
    {
      message:
        "Güncelleme için en az ad, üst kategori, görsel veya sıra alanından biri gerekli",
    },
  );

/** Navbar / ürünler: kardeş kategorilerin tam listesi, yeni sıra */
export const reorderCategoriesSchema = z.object({
  parentId: z.union([z.number().int().positive(), z.null()]),
  orderedIds: z.array(z.number().int().positive()).min(1),
});

export type ReorderCategoriesInput = z.infer<typeof reorderCategoriesSchema>;

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
