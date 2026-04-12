import { integer, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

/** Tek satır: dijital kütüphane indirme bağlantıları (id=1). */
export const digitalLibrary = pgTable("digital_library", {
  id: integer("id").primaryKey().default(1),
  zipUrl: text("zip_url").notNull().default(""),
  pptUrl: text("ppt_url").notNull().default(""),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .default(sql`now()`),
});

export type DigitalLibrary = typeof digitalLibrary.$inferSelect;
export type NewDigitalLibrary = typeof digitalLibrary.$inferInsert;
