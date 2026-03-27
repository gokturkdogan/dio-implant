import { z } from "zod";

export const categoryIdSchema = z.coerce.number().int().positive();

export const createCategorySchema = z.object({
  name: z.string().trim().min(1, "Category name is required").max(120),
});

export const updateCategorySchema = createCategorySchema.partial().refine(
  (data) => Object.keys(data).length > 0,
  {
    message: "At least one field is required for update",
  }
);

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
