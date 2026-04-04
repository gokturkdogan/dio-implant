import { eq, sql } from "drizzle-orm";
import { siteContact } from "../db/schema";
import { db } from "../lib/drizzle";
import { AppError } from "../lib/errors";
import type { SiteContactUpsertInput } from "../validations/contact.validation";

const SINGLETON_ID = 1;

export const siteContactService = {
  async get() {
    return db.query.siteContact.findFirst({
      where: eq(siteContact.id, SINGLETON_ID),
    });
  },

  async upsert(input: SiteContactUpsertInput) {
    const row = await this.get();
    const payload = {
      companyName: input.companyName,
      centerLabel: input.centerLabel,
      address: input.address,
      phone: input.phone,
      email: input.email,
      hours: input.hours,
      mapDirectionsUrl: input.mapDirectionsUrl,
      mapEmbedUrl: input.mapEmbedUrl,
      updatedAt: sql`now()`,
    };

    if (!row) {
      const [inserted] = await db
        .insert(siteContact)
        .values({ id: SINGLETON_ID, ...payload })
        .returning();
      if (!inserted) throw new AppError("İletişim bilgileri kaydedilemedi", 500);
      return inserted;
    }

    const [updated] = await db
      .update(siteContact)
      .set(payload)
      .where(eq(siteContact.id, SINGLETON_ID))
      .returning();
    if (!updated) throw new AppError("İletişim bilgileri güncellenemedi", 500);
    return updated;
  },
};
