import { and, asc, eq, ne, sql } from "drizzle-orm";
import { categories } from "../db/schema";
import {
  CATEGORIES_ROOT,
  categoryFolder,
  deleteCloudinaryFolderPath,
  downloadUrlToBuffer,
  processBufferToCloudinaryWebp,
  tryDestroyPublicId,
} from "../lib/cloudinary-media";
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

async function hasChildCategories(id: number): Promise<boolean> {
  const row = await db.query.categories.findFirst({
    where: eq(categories.parentId, id),
    columns: { id: true },
  });
  return row != null;
}

/** Alt kategori yalnızca kök (parent_id null) kategoriye bağlanabilir — tek seviye hiyerarşi */
async function assertParentIsRootCategory(parentId: number): Promise<void> {
  const p = await db.query.categories.findFirst({
    where: eq(categories.id, parentId),
    columns: { id: true, parentId: true },
  });
  if (!p) {
    throw new AppError("Üst kategori bulunamadı", 404);
  }
  if (p.parentId != null) {
    throw new AppError(
      "Alt kategorinin altına kategori eklenemez. Alt kategori yalnızca bir üst kategoriye bağlanır.",
      400
    );
  }
}

export const categoryService = {
  async listAll() {
    return db.query.categories.findMany({
      orderBy: [
        sql`CASE WHEN ${categories.parentId} IS NULL THEN 0 ELSE 1 END`,
        asc(categories.name),
      ],
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
    const parentId =
      input.parentId === undefined || input.parentId === null
        ? null
        : input.parentId;
    if (parentId != null) {
      await assertParentIsRootCategory(parentId);
    }

    const slug = await buildUniqueCategorySlug(input.name);

    const inserted = await db
      .insert(categories)
      .values({
        name: input.name,
        slug,
        parentId,
        imageUrl: input.imageUrl ?? null,
      })
      .returning();

    return inserted[0];
  },

  async update(id: number, input: UpdateCategoryInput) {
    const current = await this.getById(id);
    const oldSlug = current.slug;

    const nextName = input.name;
    const newSlug =
      nextName !== undefined
        ? await buildUniqueCategorySlug(nextName, id)
        : current.slug;

    let imageForRow =
      input.imageUrl !== undefined ? input.imageUrl : current.imageUrl ?? null;

    if (newSlug !== oldSlug) {
      if (imageForRow) {
        try {
          const buf = await downloadUrlToBuffer(imageForRow);
          imageForRow = await processBufferToCloudinaryWebp(
            buf,
            categoryFolder(newSlug),
            "image",
          );
          await tryDestroyPublicId(`${categoryFolder(oldSlug)}/image`);
          await tryDestroyPublicId(`${CATEGORIES_ROOT}/${oldSlug}`);
          await deleteCloudinaryFolderPath(categoryFolder(oldSlug));
        } catch {
          imageForRow = current.imageUrl ?? null;
        }
      } else {
        await tryDestroyPublicId(`${categoryFolder(oldSlug)}/image`);
        await tryDestroyPublicId(`${CATEGORIES_ROOT}/${oldSlug}`);
        await deleteCloudinaryFolderPath(categoryFolder(oldSlug));
      }
    }

    if (newSlug === oldSlug && input.imageUrl === null) {
      imageForRow = null;
      await tryDestroyPublicId(`${categoryFolder(newSlug)}/image`);
    }

    const patch: Partial<{
      name: string;
      slug: string;
      parentId: number | null;
      imageUrl: string | null;
    }> = {};

    if (nextName !== undefined) {
      patch.name = nextName;
      patch.slug = newSlug;
    }

    if (input.parentId !== undefined) {
      if (input.parentId === null) {
        if (current.parentId != null) {
          patch.parentId = null;
        }
      } else {
        if (input.parentId === id) {
          throw new AppError("Kategori kendi altında olamaz", 400);
        }
        await assertParentIsRootCategory(input.parentId);
        const isRoot = current.parentId == null;
        if (isRoot && (await hasChildCategories(id))) {
          throw new AppError(
            "Alt kategorisi olan üst kategori, başka bir kategorinin altına taşınamaz.",
            400
          );
        }
        patch.parentId = input.parentId;
      }
    }

    if (newSlug !== oldSlug && imageForRow !== current.imageUrl) {
      patch.imageUrl = imageForRow;
    } else if (input.imageUrl !== undefined) {
      patch.imageUrl = imageForRow;
    }

    if (Object.keys(patch).length === 0) {
      return current;
    }

    const updated = await db
      .update(categories)
      .set(patch)
      .where(eq(categories.id, id))
      .returning();

    return updated[0]!;
  },

  async remove(id: number) {
    const row = await this.getById(id);

    if (await hasChildCategories(id)) {
      throw new AppError(
        "Alt kategorisi varken bu kategori silinemez. Önce alt kategorileri silin veya taşıyın.",
        409
      );
    }

    try {
      await db.delete(categories).where(eq(categories.id, id));
    } catch {
      throw new AppError(
        "Bu kategoriye bağlı ürün varken silinemez.",
        409
      );
    }

    await tryDestroyPublicId(`${categoryFolder(row.slug)}/image`);
    await tryDestroyPublicId(`${CATEGORIES_ROOT}/${row.slug}`);
    await deleteCloudinaryFolderPath(categoryFolder(row.slug));
  },
};
