import { asc, eq, sql } from "drizzle-orm";
import { siteCatalogs } from "../db/schema";
import { deleteCloudinaryFolderPath } from "../lib/cloudinary-media";
import { db } from "../lib/drizzle";
import { AppError } from "../lib/errors";
import type {
  SiteCatalogCreateInput,
  SiteCatalogUpdateInput,
} from "../validations/site-catalog.validation";

export const siteCatalogService = {
  async listAll() {
    return db.query.siteCatalogs.findMany({
      orderBy: [asc(siteCatalogs.sortOrder), asc(siteCatalogs.title)],
    });
  },

  async getById(id: number) {
    return db.query.siteCatalogs.findFirst({
      where: eq(siteCatalogs.id, id),
    });
  },

  async create(input: SiteCatalogCreateInput) {
    const [row] = await db
      .insert(siteCatalogs)
      .values({
        sortOrder: input.sortOrder ?? 0,
        title: input.title,
        pdfUrl: input.pdfUrl,
      })
      .returning();
    if (!row) throw new AppError("Katalog eklenemedi", 500);
    return row;
  },

  async update(id: number, input: SiteCatalogUpdateInput) {
    const existing = await this.getById(id);
    if (!existing) throw new AppError("Katalog bulunamadı", 404);

    const [row] = await db
      .update(siteCatalogs)
      .set({
        sortOrder: input.sortOrder ?? existing.sortOrder,
        title: input.title,
        pdfUrl: input.pdfUrl,
        updatedAt: sql`now()`,
      })
      .where(eq(siteCatalogs.id, id))
      .returning();
    if (!row) throw new AppError("Katalog güncellenemedi", 500);
    return row;
  },

  async setCoverAssets(id: number, coverImageUrl: string, cloudinaryFolder: string) {
    const existing = await this.getById(id);
    if (!existing) throw new AppError("Katalog bulunamadı", 404);

    const [row] = await db
      .update(siteCatalogs)
      .set({
        coverImageUrl,
        cloudinaryFolder,
        updatedAt: sql`now()`,
      })
      .where(eq(siteCatalogs.id, id))
      .returning();
    if (!row) throw new AppError("Kapak kaydedilemedi", 500);
    return row;
  },

  async clearCoverAssets(id: number) {
    const existing = await this.getById(id);
    if (!existing) throw new AppError("Katalog bulunamadı", 404);

    const folder = existing.cloudinaryFolder?.trim();
    if (folder) {
      await deleteCloudinaryFolderPath(folder);
    }

    const [row] = await db
      .update(siteCatalogs)
      .set({
        coverImageUrl: null,
        cloudinaryFolder: null,
        updatedAt: sql`now()`,
      })
      .where(eq(siteCatalogs.id, id))
      .returning();
    if (!row) throw new AppError("Kapak kaldırılamadı", 500);
    return row;
  },

  async delete(id: number) {
    const existing = await this.getById(id);
    if (!existing) throw new AppError("Katalog bulunamadı", 404);
    const folder = existing.cloudinaryFolder?.trim();
    if (folder) {
      await deleteCloudinaryFolderPath(folder);
    }
    await db.delete(siteCatalogs).where(eq(siteCatalogs.id, id));
  },
};
