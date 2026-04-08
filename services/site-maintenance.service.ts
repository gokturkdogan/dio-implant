import { eq, sql } from "drizzle-orm";
import { siteMaintenance } from "@/db/schema";
import { db } from "@/lib/drizzle";
import { AppError } from "@/lib/errors";

const SINGLETON_ID = 1;

export const siteMaintenanceService = {
  async get() {
    return db.query.siteMaintenance.findFirst({
      where: eq(siteMaintenance.id, SINGLETON_ID),
    });
  },

  async isEnabled() {
    const row = await this.get();
    return row?.enabled === true;
  },

  async upsert(input: { enabled: boolean; message?: string }) {
    const row = await this.get();
    const payload = {
      enabled: input.enabled,
      message: input.message ?? "",
      updatedAt: sql`now()`,
    };

    if (!row) {
      const [inserted] = await db
        .insert(siteMaintenance)
        .values({ id: SINGLETON_ID, ...payload })
        .returning();
      if (!inserted) throw new AppError("Bakım modu ayarı kaydedilemedi", 500);
      return inserted;
    }

    const [updated] = await db
      .update(siteMaintenance)
      .set(payload)
      .where(eq(siteMaintenance.id, SINGLETON_ID))
      .returning();
    if (!updated) throw new AppError("Bakım modu ayarı güncellenemedi", 500);
    return updated;
  },
};

