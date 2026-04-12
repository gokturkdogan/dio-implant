import { eq, sql } from "drizzle-orm";
import { digitalLibrary } from "@/db/schema";
import { db } from "@/lib/drizzle";
import { AppError } from "@/lib/errors";

const SINGLETON_ID = 1;

export const digitalLibraryService = {
  async get() {
    return db.query.digitalLibrary.findFirst({
      where: eq(digitalLibrary.id, SINGLETON_ID),
    });
  },

  async upsert(input: { zipUrl: string; pptUrl: string }) {
    const row = await this.get();
    const payload = {
      zipUrl: input.zipUrl.trim(),
      pptUrl: input.pptUrl.trim(),
      updatedAt: sql`now()`,
    };

    if (!row) {
      const [inserted] = await db
        .insert(digitalLibrary)
        .values({ id: SINGLETON_ID, ...payload })
        .returning();
      if (!inserted) {
        throw new AppError("Dijital kütüphane ayarı kaydedilemedi", 500);
      }
      return inserted;
    }

    const [updated] = await db
      .update(digitalLibrary)
      .set(payload)
      .where(eq(digitalLibrary.id, SINGLETON_ID))
      .returning();
    if (!updated) {
      throw new AppError("Dijital kütüphane ayarı güncellenemedi", 500);
    }
    return updated;
  },
};
