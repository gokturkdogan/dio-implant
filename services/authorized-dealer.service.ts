import { and, asc, eq, inArray, ne, sql } from "drizzle-orm";
import { authorizedDealers, dealerProvinces, provinces } from "../db/schema";
import type { AuthorizedDealer } from "../db/schema/authorized-dealer";
import type { Province } from "../db/schema/province";
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

export type AuthorizedDealerWithProvinces = AuthorizedDealer & {
  provinces: Province[];
};

/** Verilen provinceIds başka bayilerde kullanılıyor mu kontrol eder; varsa AppError(409) fırlatır. */
async function ensureProvincesAreFree(
  provinceIds: number[],
  ignoreDealerId?: number,
): Promise<void> {
  if (provinceIds.length === 0) return;

  const baseFilter =
    ignoreDealerId != null
      ? and(
          inArray(dealerProvinces.provinceId, provinceIds),
          ne(dealerProvinces.dealerId, ignoreDealerId),
        )
      : inArray(dealerProvinces.provinceId, provinceIds);

  const conflicting = await db
    .select({
      provinceCode: provinces.code,
      provinceName: provinces.name,
      dealerName: authorizedDealers.name,
    })
    .from(dealerProvinces)
    .innerJoin(provinces, eq(provinces.id, dealerProvinces.provinceId))
    .innerJoin(authorizedDealers, eq(authorizedDealers.id, dealerProvinces.dealerId))
    .where(baseFilter);

  if (conflicting.length > 0) {
    const detail = conflicting
      .map((c) => `${c.provinceCode} ${c.provinceName} → ${c.dealerName}`)
      .join(", ");
    throw new AppError(`Şu iller başka bayilerde kayıtlı: ${detail}`, 409);
  }
}

async function validateProvinceIdsExist(provinceIds: number[]) {
  if (provinceIds.length === 0) return;
  const found = await db
    .select({ id: provinces.id })
    .from(provinces)
    .where(inArray(provinces.id, provinceIds));
  if (found.length !== provinceIds.length) {
    throw new AppError("Geçersiz il seçimi", 400);
  }
}

async function loadProvincesForDealers(dealerIds: number[]) {
  if (dealerIds.length === 0) return new Map<number, Province[]>();
  const rows = await db
    .select({
      dealerId: dealerProvinces.dealerId,
      province: provinces,
    })
    .from(dealerProvinces)
    .innerJoin(provinces, eq(provinces.id, dealerProvinces.provinceId))
    .where(inArray(dealerProvinces.dealerId, dealerIds))
    .orderBy(asc(provinces.code));

  const byDealer = new Map<number, Province[]>();
  for (const r of rows) {
    const list = byDealer.get(r.dealerId) ?? [];
    list.push(r.province);
    byDealer.set(r.dealerId, list);
  }
  return byDealer;
}

function regionLabelFromProvinces(list: Province[]): string {
  return list.map((p) => p.name).join(", ");
}

async function fetchProvincesByIds(provinceIds: number[]): Promise<Province[]> {
  if (provinceIds.length === 0) return [];
  return db
    .select()
    .from(provinces)
    .where(inArray(provinces.id, provinceIds))
    .orderBy(asc(provinces.code));
}

export const authorizedDealerService = {
  async listAll(): Promise<AuthorizedDealerWithProvinces[]> {
    const list = await db.query.authorizedDealers.findMany({
      orderBy: [asc(authorizedDealers.sortOrder), asc(authorizedDealers.name)],
    });
    if (list.length === 0) return [];

    const byDealer = await loadProvincesForDealers(list.map((d) => d.id));
    return list.map((d) => ({
      ...d,
      provinces: byDealer.get(d.id) ?? [],
    }));
  },

  async getById(id: number): Promise<AuthorizedDealerWithProvinces | null> {
    const dealer = await db.query.authorizedDealers.findFirst({
      where: eq(authorizedDealers.id, id),
    });
    if (!dealer) return null;
    const byDealer = await loadProvincesForDealers([dealer.id]);
    return { ...dealer, provinces: byDealer.get(dealer.id) ?? [] };
  },

  async create(input: AuthorizedDealerCreateInput): Promise<AuthorizedDealerWithProvinces> {
    await validateProvinceIdsExist(input.provinceIds);
    await ensureProvincesAreFree(input.provinceIds);

    const provinceRows = await fetchProvincesByIds(input.provinceIds);

    const [row] = await db
      .insert(authorizedDealers)
      .values({
        sortOrder: input.sortOrder ?? 0,
        name: input.name,
        serviceRegion: regionLabelFromProvinces(provinceRows),
        contactPerson: nullIfEmpty(input.contactPerson),
        phone: input.phone,
        website: nullIfEmpty(input.website),
        color: input.color,
      })
      .returning();
    if (!row) throw new AppError("Bayi eklenemedi", 500);

    try {
      await db
        .insert(dealerProvinces)
        .values(input.provinceIds.map((pid) => ({ dealerId: row.id, provinceId: pid })));
    } catch (err) {
      // Eşleme eklenemediyse oluşturulan bayiyi geri al ki tutarsız kayıt kalmasın.
      await db.delete(authorizedDealers).where(eq(authorizedDealers.id, row.id));
      throw err;
    }

    return { ...row, provinces: provinceRows };
  },

  async update(
    id: number,
    input: AuthorizedDealerUpdateInput,
  ): Promise<AuthorizedDealerWithProvinces> {
    const existing = await db.query.authorizedDealers.findFirst({
      where: eq(authorizedDealers.id, id),
    });
    if (!existing) throw new AppError("Bayi bulunamadı", 404);

    await validateProvinceIdsExist(input.provinceIds);
    await ensureProvincesAreFree(input.provinceIds, id);

    const provinceRows = await fetchProvincesByIds(input.provinceIds);

    const [row] = await db
      .update(authorizedDealers)
      .set({
        sortOrder: input.sortOrder ?? existing.sortOrder,
        name: input.name,
        serviceRegion: regionLabelFromProvinces(provinceRows),
        contactPerson: nullIfEmpty(input.contactPerson),
        phone: input.phone,
        website: nullIfEmpty(input.website),
        color: input.color,
        updatedAt: sql`now()`,
      })
      .where(eq(authorizedDealers.id, id))
      .returning();
    if (!row) throw new AppError("Bayi güncellenemedi", 500);

    await db.delete(dealerProvinces).where(eq(dealerProvinces.dealerId, id));
    if (input.provinceIds.length > 0) {
      await db
        .insert(dealerProvinces)
        .values(input.provinceIds.map((pid) => ({ dealerId: id, provinceId: pid })));
    }

    return { ...row, provinces: provinceRows };
  },

  async delete(id: number) {
    const existing = await db.query.authorizedDealers.findFirst({
      where: eq(authorizedDealers.id, id),
    });
    if (!existing) throw new AppError("Bayi bulunamadı", 404);
    await db.delete(authorizedDealers).where(eq(authorizedDealers.id, id));
  },
};
