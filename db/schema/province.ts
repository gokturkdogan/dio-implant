import { sql } from "drizzle-orm";
import { pgTable, serial, text, timestamp, uniqueIndex } from "drizzle-orm/pg-core";

/**
 * Türkiye illeri ana tablosu.
 * `code` ve `name` benzersizdir; UI dropdown'ında her iki alan üzerinden arama yapılır.
 */
export const provinces = pgTable(
  "provinces",
  {
    id: serial("id").primaryKey(),
    code: text("code").notNull(),
    name: text("name").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .default(sql`now()`),
  },
  (t) => ({
    codeUniq: uniqueIndex("provinces_code_uniq").on(t.code),
    nameUniq: uniqueIndex("provinces_name_uniq").on(t.name),
  }),
);

export type Province = typeof provinces.$inferSelect;
export type NewProvince = typeof provinces.$inferInsert;
