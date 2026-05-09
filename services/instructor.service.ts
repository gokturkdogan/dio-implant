import "server-only";
import { desc, eq, inArray } from "drizzle-orm";
import { instructors, type InstructorRow, type NewInstructorRow } from "../db/schema";
import { db } from "../lib/drizzle";
import type { InstructorRecord } from "../lib/instructor-types";

function rowToRecord(r: InstructorRow): InstructorRecord {
  return {
    id: r.id,
    name: r.name,
    photoUrl: r.photoUrl ?? undefined,
    education: r.education ?? [],
    specialties: r.specialties ?? [],
    bio: r.bio,
    createdAt: r.createdAt.toISOString(),
    updatedAt: r.updatedAt.toISOString(),
  };
}

export const instructorService = {
  async listAll(): Promise<InstructorRecord[]> {
    const rows = await db.query.instructors.findMany({
      // İkincil sıra: aynı created_at ile gelen kayıtlarda PG sırası belirsiz olabilir;
      // SSR ile client refetch farklı sırayı üretip hydration uyarısına yol açmasın.
      orderBy: [desc(instructors.createdAt), desc(instructors.id)],
    });
    return rows.map(rowToRecord);
  },

  async getById(id: number): Promise<InstructorRecord | undefined> {
    const row = await db.query.instructors.findFirst({
      where: eq(instructors.id, id),
    });
    return row ? rowToRecord(row) : undefined;
  },

  async getByIds(ids: number[]): Promise<InstructorRecord[]> {
    const unique = [...new Set(ids.filter((n) => Number.isFinite(n) && n > 0))];
    if (!unique.length) return [];
    const rows = await db.query.instructors.findMany({
      where: inArray(instructors.id, unique),
    });
    return rows.map(rowToRecord);
  },

  /**
   * Veritabanındaki `name` ile birebir (trim) eşleşen kayıtlar.
   * Aynı adda birden fazla eğitmen varsa o isim haritada yer almaz (belirsizlik).
   */
  async mapUniqueByExactNames(names: string[]): Promise<Map<string, InstructorRecord>> {
    const trimmed = [...new Set(names.map((n) => n.trim()).filter(Boolean))];
    if (!trimmed.length) return new Map();
    const rows = await db.query.instructors.findMany({
      where: inArray(instructors.name, trimmed),
    });
    const grouped = new Map<string, InstructorRecord[]>();
    for (const row of rows) {
      const r = rowToRecord(row);
      const k = r.name.trim();
      const list = grouped.get(k) ?? [];
      list.push(r);
      grouped.set(k, list);
    }
    const out = new Map<string, InstructorRecord>();
    for (const t of trimmed) {
      const list = grouped.get(t);
      if (list?.length === 1) out.set(t, list[0]);
    }
    return out;
  },

  async create(data: Omit<InstructorRecord, "id" | "createdAt" | "updatedAt">): Promise<InstructorRecord> {
    const insert: NewInstructorRow = {
      name: data.name,
      photoUrl: data.photoUrl ?? null,
      education: data.education,
      specialties: data.specialties,
      bio: data.bio,
    };
    const [row] = await db.insert(instructors).values(insert).returning();
    if (!row) throw new Error("Eğitmen oluşturulamadı");
    return rowToRecord(row);
  },

  async update(
    id: number,
    data: Omit<InstructorRecord, "id" | "createdAt" | "updatedAt">,
  ): Promise<InstructorRecord | undefined> {
    const [row] = await db
      .update(instructors)
      .set({
        name: data.name,
        photoUrl: data.photoUrl ?? null,
        education: data.education,
        specialties: data.specialties,
        bio: data.bio,
        updatedAt: new Date(),
      })
      .where(eq(instructors.id, id))
      .returning();
    return row ? rowToRecord(row) : undefined;
  },

  async setPhotoUrl(id: number, photoUrl: string | null): Promise<void> {
    await db
      .update(instructors)
      .set({ photoUrl, updatedAt: new Date() })
      .where(eq(instructors.id, id));
  },

  async deleteById(id: number): Promise<boolean> {
    const result = await db
      .delete(instructors)
      .where(eq(instructors.id, id))
      .returning({ id: instructors.id });
    return result.length > 0;
  },
};
