import { asc, eq, sql } from "drizzle-orm";
import { authorizedDealers } from "../db/schema";
import { db } from "../lib/drizzle";
import { AppError } from "../lib/errors";
import type {
  AuthorizedDealerCreateInput,
  AuthorizedDealerUpdateInput,
} from "../validations/contact.validation";

function nullIfEmpty(s: string | undefined): string | null {
  if (s == null || s === "") return null;
  return s;
}

export const authorizedDealerService = {
  async listAll() {
    return db.query.authorizedDealers.findMany({
      orderBy: [asc(authorizedDealers.sortOrder), asc(authorizedDealers.name)],
    });
  },

  async getById(id: number) {
    return db.query.authorizedDealers.findFirst({
      where: eq(authorizedDealers.id, id),
    });
  },

  async create(input: AuthorizedDealerCreateInput) {
    const [row] = await db
      .insert(authorizedDealers)
      .values({
        sortOrder: input.sortOrder ?? 0,
        name: input.name,
        serviceRegion: input.serviceRegion,
        contactPerson: nullIfEmpty(input.contactPerson),
        phone: input.phone,
        website: nullIfEmpty(input.website),
      })
      .returning();
    if (!row) throw new AppError("Bayi eklenemedi", 500);
    return row;
  },

  async update(id: number, input: AuthorizedDealerUpdateInput) {
    const existing = await this.getById(id);
    if (!existing) throw new AppError("Bayi bulunamadı", 404);

    const [row] = await db
      .update(authorizedDealers)
      .set({
        sortOrder: input.sortOrder ?? existing.sortOrder,
        name: input.name,
        serviceRegion: input.serviceRegion,
        contactPerson: nullIfEmpty(input.contactPerson),
        phone: input.phone,
        website: nullIfEmpty(input.website),
        updatedAt: sql`now()`,
      })
      .where(eq(authorizedDealers.id, id))
      .returning();
    if (!row) throw new AppError("Bayi güncellenemedi", 500);
    return row;
  },

  async delete(id: number) {
    const existing = await this.getById(id);
    if (!existing) throw new AppError("Bayi bulunamadı", 404);
    await db.delete(authorizedDealers).where(eq(authorizedDealers.id, id));
  },
};
