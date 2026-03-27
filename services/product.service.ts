import { and, eq, ne } from "drizzle-orm";
import { categories, products } from "../db/schema";
import { db } from "../lib/drizzle";
import { AppError } from "../lib/errors";
import { slugify } from "../lib/slug";
import type {
  CreateProductInput,
  ProductQueryInput,
  UpdateProductInput,
} from "../validations/product.validation";

const ensureCategoryExists = async (categoryId: number): Promise<void> => {
  const existingCategory = await db.query.categories.findFirst({
    where: eq(categories.id, categoryId),
    columns: { id: true },
  });

  if (!existingCategory) {
    throw new AppError("Category not found", 404);
  }
};

const buildUniqueProductSlug = async (
  name: string,
  excludeId?: number
): Promise<string> => {
  const base = slugify(name);
  if (!base) {
    throw new AppError("Invalid product name for slug generation", 400);
  }

  let candidate = base;
  let suffix = 1;

  while (true) {
    const existing = await db.query.products.findFirst({
      where: excludeId
        ? and(eq(products.slug, candidate), ne(products.id, excludeId))
        : eq(products.slug, candidate),
      columns: { id: true },
    });

    if (!existing || (excludeId && existing.id === excludeId)) {
      return candidate;
    }

    suffix += 1;
    candidate = `${base}-${suffix}`;
  }
};

export const productService = {
  async listAll(query?: ProductQueryInput) {
    if (query?.categorySlug) {
      return db
        .select({
          id: products.id,
          name: products.name,
          slug: products.slug,
          description: products.description,
          categoryId: products.categoryId,
          createdAt: products.createdAt,
        })
        .from(products)
        .innerJoin(categories, eq(products.categoryId, categories.id))
        .where(eq(categories.slug, query.categorySlug))
        .orderBy(products.createdAt);
    }

    return db.query.products.findMany({
      orderBy: (table, { desc }) => [desc(table.createdAt)],
    });
  },

  async getById(id: number) {
    const product = await db.query.products.findFirst({
      where: eq(products.id, id),
    });

    if (!product) {
      throw new AppError("Product not found", 404);
    }

    return product;
  },

  async create(input: CreateProductInput) {
    await ensureCategoryExists(input.categoryId);

    const slug = await buildUniqueProductSlug(input.name);

    const inserted = await db
      .insert(products)
      .values({
        name: input.name,
        slug,
        description: input.description,
        categoryId: input.categoryId,
      })
      .returning();

    return inserted[0];
  },

  async update(id: number, input: UpdateProductInput) {
    const existing = await this.getById(id);

    if (input.categoryId) {
      await ensureCategoryExists(input.categoryId);
    }

    const nextName = input.name ?? existing.name;
    const slug =
      input.name !== undefined
        ? await buildUniqueProductSlug(nextName, id)
        : existing.slug;

    const updated = await db
      .update(products)
      .set({
        ...(input.name !== undefined ? { name: input.name } : {}),
        ...(input.description !== undefined
          ? { description: input.description }
          : {}),
        ...(input.categoryId !== undefined
          ? { categoryId: input.categoryId }
          : {}),
        slug,
      })
      .where(eq(products.id, id))
      .returning();

    return updated[0];
  },

  async remove(id: number) {
    await this.getById(id);
    await db.delete(products).where(eq(products.id, id));
  },
};
