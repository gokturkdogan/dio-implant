import { eq } from "drizzle-orm";
import { sitePopups } from "../db/schema";
import { db } from "../lib/drizzle";
import { AppError } from "../lib/errors";
import type {
  CreateSitePopupInput,
  UpdateSitePopupInput,
} from "../validations/site-popup.validation";

export const sitePopupService = {
  async listAll() {
    return db.query.sitePopups.findMany({
      orderBy: (table, { desc }) => [desc(table.updatedAt)],
    });
  },

  async getByKey(key: string) {
    const row = await db.query.sitePopups.findFirst({
      where: eq(sitePopups.key, key),
    });

    if (!row) {
      throw new AppError("Site popup not found", 404);
    }

    return row;
  },

  async create(input: CreateSitePopupInput) {
    const inserted = await db
      .insert(sitePopups)
      .values({
        key: input.key,
        enabled: input.enabled ?? false,
        imageUrl: input.imageUrl,
        linkUrl: input.linkUrl ?? null,
        openInNewTab: input.openInNewTab ?? false,
        startAt: input.startAt ?? null,
        endAt: input.endAt ?? null,
      })
      .returning();

    return inserted[0];
  },

  async upsertByKey(key: string, input: UpdateSitePopupInput) {
    const existing = await db.query.sitePopups.findFirst({
      where: eq(sitePopups.key, key),
      columns: { id: true },
    });

    if (!existing) {
      if (!input.imageUrl) {
        throw new AppError("imageUrl is required for initial create", 400);
      }

      const inserted = await db
        .insert(sitePopups)
        .values({
          key,
          enabled: input.enabled ?? false,
          imageUrl: input.imageUrl,
          linkUrl: input.linkUrl ?? null,
          openInNewTab: input.openInNewTab ?? false,
          startAt: input.startAt ?? null,
          endAt: input.endAt ?? null,
        })
        .returning();

      return inserted[0];
    }

    const updated = await db
      .update(sitePopups)
      .set({
        ...(input.enabled !== undefined ? { enabled: input.enabled } : {}),
        ...(input.imageUrl !== undefined ? { imageUrl: input.imageUrl } : {}),
        ...(input.linkUrl !== undefined ? { linkUrl: input.linkUrl } : {}),
        ...(input.openInNewTab !== undefined
          ? { openInNewTab: input.openInNewTab }
          : {}),
        ...(input.startAt !== undefined ? { startAt: input.startAt } : {}),
        ...(input.endAt !== undefined ? { endAt: input.endAt } : {}),
        updatedAt: new Date(),
      })
      .where(eq(sitePopups.key, key))
      .returning();

    return updated[0];
  },
};

