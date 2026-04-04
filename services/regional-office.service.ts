import { asc, eq, sql } from "drizzle-orm";
import { regionalOffices } from "../db/schema";
import { db } from "../lib/drizzle";
import { AppError } from "../lib/errors";
import type {
  RegionalOfficeCreateInput,
  RegionalOfficeUpdateInput,
} from "../validations/contact.validation";

export const regionalOfficeService = {
  async listAll() {
    return db.query.regionalOffices.findMany({
      orderBy: [asc(regionalOffices.sortOrder), asc(regionalOffices.name)],
    });
  },

  async getById(id: number) {
    return db.query.regionalOffices.findFirst({
      where: eq(regionalOffices.id, id),
    });
  },

  async create(input: RegionalOfficeCreateInput) {
    const [row] = await db
      .insert(regionalOffices)
      .values({
        sortOrder: input.sortOrder ?? 0,
        name: input.name,
        coverage: input.coverage,
        phone: input.phone,
        email: input.email,
        address: input.address,
        mapDirectionsUrl: input.mapDirectionsUrl ?? "",
      })
      .returning();
    if (!row) throw new AppError("Ofis eklenemedi", 500);
    return row;
  },

  async update(id: number, input: RegionalOfficeUpdateInput) {
    const existing = await this.getById(id);
    if (!existing) throw new AppError("Ofis bulunamadı", 404);

    const [row] = await db
      .update(regionalOffices)
      .set({
        sortOrder: input.sortOrder ?? existing.sortOrder,
        name: input.name,
        coverage: input.coverage,
        phone: input.phone,
        email: input.email,
        address: input.address,
        mapDirectionsUrl: input.mapDirectionsUrl ?? "",
        updatedAt: sql`now()`,
      })
      .where(eq(regionalOffices.id, id))
      .returning();
    if (!row) throw new AppError("Ofis güncellenemedi", 500);
    return row;
  },

  async delete(id: number) {
    const existing = await this.getById(id);
    if (!existing) throw new AppError("Ofis bulunamadı", 404);
    await db.delete(regionalOffices).where(eq(regionalOffices.id, id));
  },
};
