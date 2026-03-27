import { and, eq, ne } from "drizzle-orm";
import { categories } from "../db/schema";
import { db } from "../lib/drizzle";
import { AppError } from "../lib/errors";
import { slugify } from "../lib/slug";
import type {
  CreateCategoryInput,
  UpdateCategoryInput,
} from "../validations/category.validation";

const buildUniqueCategorySlug = async (
  name: string,
  excludeId?: number
): Promise<string> => {
  const base = slugify(name);
  if (!base) {
    throw new AppError("Invalid category name for slug generation", 400);
  }

  let candidate = base;
  let suffix = 1;

  while (true) {
    const existing = await db.query.categories.findFirst({
      where: excludeId
        ? and(eq(categories.slug, candidate), ne(categories.id, excludeId))
        : eq(categories.slug, candidate),
      columns: { id: true },
    });

    if (!existing || (excludeId && existing.id === excludeId)) {
      return candidate;
    }

    suffix += 1;
    candidate = `${base}-${suffix}`;
  }
};

export const categoryService = {
  async listAll() {
    return db.query.categories.findMany({
      orderBy: (table, { desc }) => [desc(table.createdAt)],
    });
  },

  async getById(id: number) {
    const category = await db.query.categories.findFirst({
      where: eq(categories.id, id),
    });

    if (!category) {
      throw new AppError("Category not found", 404);
    }

    return category;
  },

  async create(input: CreateCategoryInput) {
    const slug = await buildUniqueCategorySlug(input.name);

    const inserted = await db
      .insert(categories)
      .values({
        name: input.name,
        slug,
      })
      .returning();

    return inserted[0];
  },

  async update(id: number, input: UpdateCategoryInput) {
    await this.getById(id);

    const nextName = input.name;
    const slug = nextName
      ? await buildUniqueCategorySlug(nextName, id)
      : undefined;

    const updated = await db
      .update(categories)
      .set({
        ...(nextName ? { name: nextName, slug } : {}),
      })
      .where(eq(categories.id, id))
      .returning();

    return updated[0];
  },

  async remove(id: number) {
    await this.getById(id);

    try {
      await db.delete(categories).where(eq(categories.id, id));
    } catch {
      throw new AppError(
        "Category cannot be deleted while products reference it",
        409
      );
    }
  },
};
