import { z } from "zod";

export const productIdSchema = z.coerce.number().int().positive();

export const createProductSchema = z.object({
  name: z.string().trim().min(1, "Product name is required").max(160),
  description: z.string().trim().max(5000).optional(),
  categoryId: z.coerce.number().int().positive(),
});

export const updateProductSchema = createProductSchema.partial().refine(
  (data) => Object.keys(data).length > 0,
  {
    message: "At least one field is required for update",
  }
);

export const productQuerySchema = z.object({
  categorySlug: z.string().trim().min(1).optional(),
});

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type ProductQueryInput = z.infer<typeof productQuerySchema>;
