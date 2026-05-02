import { sql } from "drizzle-orm";
import { integer, pgTable, primaryKey, timestamp, uniqueIndex } from "drizzle-orm/pg-core";
import { authorizedDealers } from "./authorized-dealer";
import { provinces } from "./province";

/**
 * Bayi <-> İl eşleme tablosu.
 *
 * - (dealer_id, province_id) bileşik PK
 * - province_id üzerinde benzersiz indeks: bir il yalnızca tek bayide olabilir.
 * - Bayi silinirse eşlemeler de silinir; il silinmeye çalışılırsa korunur (RESTRICT).
 */
export const dealerProvinces = pgTable(
  "dealer_provinces",
  {
    dealerId: integer("dealer_id")
      .notNull()
      .references(() => authorizedDealers.id, { onDelete: "cascade" }),
    provinceId: integer("province_id")
      .notNull()
      .references(() => provinces.id, { onDelete: "restrict" }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .default(sql`now()`),
  },
  (t) => ({
    pk: primaryKey({ name: "dealer_provinces_pkey", columns: [t.dealerId, t.provinceId] }),
    provinceUniq: uniqueIndex("dealer_provinces_province_uniq").on(t.provinceId),
  }),
);

export type DealerProvince = typeof dealerProvinces.$inferSelect;
export type NewDealerProvince = typeof dealerProvinces.$inferInsert;
