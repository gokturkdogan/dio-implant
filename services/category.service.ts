import { and, asc, desc, eq, isNull, ne } from "drizzle-orm";
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
async function nextSortOrderForParent(parentId: number | null): Promise<number> {
  const row = await db.query.categories.findFirst({
    where:
      parentId == null
        ? isNull(categories.parentId)
        : eq(categories.parentId, parentId),
    orderBy: [desc(categories.sortOrder)],
    columns: { sortOrder: true },
  });
  return (row?.sortOrder ?? -1) + 1;
}

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
    const rows = await db.query.categories.findMany({
      orderBy: [asc(categories.id)],
    });
    const rootList = rows
      .filter((c) => c.parentId == null)
      .sort((a, b) => {
        if (a.sortOrder !== b.sortOrder) return a.sortOrder - b.sortOrder;
        return a.name.localeCompare(b.name, "tr");
      });
    const childrenByParent = new Map<number, typeof rows>();
    for (const c of rows) {
      if (c.parentId == null) continue;
      const list = childrenByParent.get(c.parentId) ?? [];
      list.push(c);
      childrenByParent.set(c.parentId, list);
    }
    for (const [, list] of childrenByParent) {
      list.sort((a, b) => {
        if (a.sortOrder !== b.sortOrder) return a.sortOrder - b.sortOrder;
        return a.name.localeCompare(b.name, "tr");
      });
    }
    const out: typeof rows = [];
    const seenChildIds = new Set<number>();
    for (const r of rootList) {
      out.push(r);
      const kids = childrenByParent.get(r.id);
      if (kids) {
        for (const k of kids) {
          out.push(k);
          seenChildIds.add(k.id);
        }
      }
    }
    const orphans = rows.filter(
      (c) => c.parentId != null && !seenChildIds.has(c.id),
    );
    orphans.sort((a, b) => {
      if (a.sortOrder !== b.sortOrder) return a.sortOrder - b.sortOrder;
      return a.name.localeCompare(b.name, "tr");
    });
    out.push(...orphans);
    return out;
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
    const sortOrder = await nextSortOrderForParent(parentId);

    const inserted = await db
      .insert(categories)
      .values({
        name: input.name,
        slug,
        parentId,
        sortOrder,
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
      sortOrder: number;
    }> = {};

    if (nextName !== undefined) {
      patch.name = nextName;
      patch.slug = newSlug;
    }

    if (input.sortOrder !== undefined) {
      patch.sortOrder = input.sortOrder;
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

    if (patch.parentId !== undefined) {
      const moved =
        (current.parentId == null) !== (patch.parentId == null) ||
        (current.parentId != null &&
          patch.parentId != null &&
          current.parentId !== patch.parentId);
      if (moved) {
        patch.sortOrder = await nextSortOrderForParent(patch.parentId);
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

  /**
   * Aynı üst kategorideki (veya kökte) kardeşlerin sırasını günceller.
   * `orderedIds` tam olarak o gruptaki tüm id’leri içermelidir.
   */
  async reorderSiblings(parentId: number | null, orderedIds: number[]) {
    const siblings = await db.query.categories.findMany({
      where:
        parentId == null
          ? isNull(categories.parentId)
          : eq(categories.parentId, parentId),
      columns: { id: true },
    });
    const expected = new Set(siblings.map((s) => s.id));
    if (orderedIds.length !== expected.size) {
      throw new AppError("Sıra listesi bu gruptaki tüm kategorileri içermelidir.", 400);
    }
    for (const id of orderedIds) {
      if (!expected.has(id)) {
        throw new AppError("Geçersiz kategori id’si veya farklı üst kategori.", 400);
      }
    }
    /* neon-http: transaction yok; kısa ardışık update yeterli */
    for (let i = 0; i < orderedIds.length; i++) {
      await db
        .update(categories)
        .set({ sortOrder: i })
        .where(eq(categories.id, orderedIds[i]!));
    }
  },
};
