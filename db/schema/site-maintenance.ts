import { boolean, integer, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

/** Tek satır: site bakım modu ayarları (id=1). */
export const siteMaintenance = pgTable("site_maintenance", {
  id: integer("id").primaryKey().default(1),
  enabled: boolean("enabled").notNull().default(false),
  message: text("message").notNull().default(""),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .default(sql`now()`),
});

export type SiteMaintenance = typeof siteMaintenance.$inferSelect;
export type NewSiteMaintenance = typeof siteMaintenance.$inferInsert;

