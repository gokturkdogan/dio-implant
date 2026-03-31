import { and, eq, ne } from "drizzle-orm";
import { categories, products, type ProductPosterItem } from "../db/schema";
import {
  deleteCloudinaryFolderPath,
  downloadUrlToBuffer,
  processBufferToCloudinaryRawPdf,
  processBufferToCloudinaryWebp,
  productFolder,
  PRODUCTS_ROOT,
  tryDestroyPublicId,
} from "../lib/cloudinary-media";
import { db } from "../lib/drizzle";
import { AppError } from "../lib/errors";
import { slugify } from "../lib/slug";
import type {
  CreateProductInput,
  ProductQueryInput,
  UpdateProductInput,
} from "../validations/product.validation";

function normalizePosterItems(
  items: Array<string | ProductPosterItem> | undefined | null,
): ProductPosterItem[] {
  if (!items?.length) return [];
  return items
    .map((item, idx) => {
      if (typeof item === "string") {
        const url = item.trim();
        if (!url) return null;
        return { title: `Afiş ${idx + 1}`, url };
      }
      const title = item.title.trim();
      const url = item.url.trim();
      if (!title || !url) return null;
      return { title, url };
    })
    .filter((x): x is ProductPosterItem => x !== null);
}

function normalizeCarouselImages(
  items: string[] | undefined | null,
): string[] {
  if (!items?.length) return [];
  return items
    .map((u) => String(u ?? "").trim())
    .filter((u) => u.length > 0)
    .slice(0, 3);
}

function assetHostedUnderProductSlug(url: string, slug: string): boolean {
  return url.includes(`/${PRODUCTS_ROOT}/${slug}/`);
}

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
          excerpt: products.excerpt,
          description: products.description,
          posterUrls: products.posterUrls,
          carouselImages: products.carouselImages,
          catalogUrl: products.catalogUrl,
          imageUrl: products.imageUrl,
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

  async getBySlug(slug: string) {
    const product = await db.query.products.findFirst({
      where: eq(products.slug, slug),
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
        excerpt: input.excerpt ?? null,
        description: input.description ?? null,
        posterUrls: normalizePosterItems(input.posterUrls),
        carouselImages: normalizeCarouselImages(input.carouselImages),
        catalogUrl: input.catalogUrl ?? null,
        imageUrl: input.imageUrl ?? null,
        categoryId: input.categoryId,
      })
      .returning();

    return inserted[0];
  },

  async update(id: number, input: UpdateProductInput) {
    const existing = await this.getById(id);
    const oldSlug = existing.slug;

    if (input.categoryId) {
      await ensureCategoryExists(input.categoryId);
    }

    const nextName = input.name ?? existing.name;
    const newSlug =
      input.name !== undefined
        ? await buildUniqueProductSlug(nextName, id)
        : existing.slug;

    let imageForRow =
      input.imageUrl !== undefined ? input.imageUrl : existing.imageUrl ?? null;
    let postersForRow =
      input.posterUrls !== undefined
        ? input.posterUrls === null
          ? []
          : normalizePosterItems(input.posterUrls)
        : normalizePosterItems(existing.posterUrls);
    let carouselForRow =
      input.carouselImages !== undefined
        ? input.carouselImages === null
          ? []
          : normalizeCarouselImages(input.carouselImages)
        : normalizeCarouselImages(existing.carouselImages);
    let catalogForRow =
      input.catalogUrl !== undefined
        ? input.catalogUrl
        : existing.catalogUrl ?? null;

    if (newSlug !== oldSlug) {
      let mainOk = !imageForRow;
      if (imageForRow) {
        mainOk = false;
        try {
          const buf = await downloadUrlToBuffer(imageForRow);
          imageForRow = await processBufferToCloudinaryWebp(
            buf,
            productFolder(newSlug),
            "main",
          );
          mainOk = true;
        } catch {
          imageForRow = existing.imageUrl ?? null;
        }
      }

      const migratedPosters: ProductPosterItem[] = [];
      let postersMigrateOk = true;
      const sourcePosters = normalizePosterItems(
        input.posterUrls !== undefined
          ? postersForRow
          : existing.posterUrls,
      );

      for (let i = 0; i < sourcePosters.length; i++) {
        const currentPoster = sourcePosters[i]!;
        try {
          const buf = await downloadUrlToBuffer(currentPoster.url);
          migratedPosters.push(
            {
              title: currentPoster.title,
              url: await processBufferToCloudinaryWebp(
                buf,
                productFolder(newSlug),
                `poster-${i + 1}`,
              ),
            },
          );
        } catch {
          migratedPosters.push(currentPoster);
          if (assetHostedUnderProductSlug(currentPoster.url, oldSlug)) {
            postersMigrateOk = false;
          }
        }
      }
      postersForRow = migratedPosters;

      const migratedCarousel: string[] = [];
      let carouselMigrateOk = true;
      const sourceCarousel = normalizeCarouselImages(
        input.carouselImages !== undefined ? carouselForRow : existing.carouselImages,
      );

      for (let i = 0; i < sourceCarousel.length; i++) {
        const current = sourceCarousel[i]!;
        try {
          const buf = await downloadUrlToBuffer(current);
          migratedCarousel.push(
            await processBufferToCloudinaryWebp(
              buf,
              productFolder(newSlug),
              `carusel-${i + 1}`,
            ),
          );
        } catch {
          migratedCarousel.push(current);
          if (assetHostedUnderProductSlug(current, oldSlug)) {
            carouselMigrateOk = false;
          }
        }
      }
      carouselForRow = migratedCarousel;

      let catalogMigrateOk = true;
      if (catalogForRow) {
        try {
          const buf = await downloadUrlToBuffer(catalogForRow);
          catalogForRow = await processBufferToCloudinaryRawPdf(
            buf,
            productFolder(newSlug),
            "catalog",
          );
        } catch {
          if (assetHostedUnderProductSlug(catalogForRow, oldSlug)) {
            catalogMigrateOk = false;
          }
        }
      }

      const stillOnOld =
        (imageForRow && assetHostedUnderProductSlug(imageForRow, oldSlug)) ||
        postersForRow.some((u) => assetHostedUnderProductSlug(u.url, oldSlug)) ||
        carouselForRow.some((u) => assetHostedUnderProductSlug(u, oldSlug)) ||
        (catalogForRow && assetHostedUnderProductSlug(catalogForRow, oldSlug));

      if (mainOk && postersMigrateOk && carouselMigrateOk && catalogMigrateOk && !stillOnOld) {
        await deleteCloudinaryFolderPath(productFolder(oldSlug));
      }
    }

    if (newSlug === oldSlug && input.imageUrl === null) {
      await tryDestroyPublicId(`${productFolder(newSlug)}/main`);
    }
    if (newSlug === oldSlug && input.catalogUrl === null) {
      await tryDestroyPublicId(`${productFolder(newSlug)}/catalog`, "raw");
    }

    const oldPosterLen = (existing.posterUrls ?? []).length;
    const newPosterLen = postersForRow.length;
    if (
      newSlug === oldSlug &&
      input.posterUrls !== undefined &&
      newPosterLen < oldPosterLen
    ) {
      for (let k = newPosterLen + 1; k <= oldPosterLen; k++) {
        await tryDestroyPublicId(`${productFolder(newSlug)}/poster-${k}`);
      }
    }
    const oldCarouselLen = (existing.carouselImages ?? []).length;
    const newCarouselLen = carouselForRow.length;
    if (
      newSlug === oldSlug &&
      input.carouselImages !== undefined &&
      newCarouselLen < oldCarouselLen
    ) {
      for (let k = newCarouselLen + 1; k <= oldCarouselLen; k++) {
        await tryDestroyPublicId(`${productFolder(newSlug)}/carusel-${k}`);
      }
    }

    const setFields: Record<string, unknown> = { slug: newSlug };

    if (input.name !== undefined) setFields.name = input.name;
    if (input.excerpt !== undefined) setFields.excerpt = input.excerpt;
    if (input.description !== undefined) setFields.description = input.description;
    if (input.categoryId !== undefined) setFields.categoryId = input.categoryId;
    if (newSlug !== oldSlug) {
      setFields.carouselImages = carouselForRow;
    } else if (input.carouselImages !== undefined) {
      setFields.carouselImages = carouselForRow;
    }
    if (newSlug !== oldSlug) {
      setFields.catalogUrl = catalogForRow;
    } else if (input.catalogUrl !== undefined) {
      setFields.catalogUrl = catalogForRow;
    }

    if (newSlug !== oldSlug) {
      setFields.imageUrl = imageForRow;
      setFields.posterUrls = postersForRow;
    } else {
      if (input.imageUrl !== undefined) setFields.imageUrl = imageForRow;
      if (input.posterUrls !== undefined) setFields.posterUrls = postersForRow;
    }

    const updated = await db
      .update(products)
      .set(setFields as never)
      .where(eq(products.id, id))
      .returning();

    return updated[0]!;
  },

  async remove(id: number) {
    const row = await this.getById(id);
    await db.delete(products).where(eq(products.id, id));
    await deleteCloudinaryFolderPath(productFolder(row.slug));
  },
};
