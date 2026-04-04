import { integer, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

/** Tek satır: genel merkez / iletişim bilgileri (id her zaman 1) */
export const siteContact = pgTable("site_contact", {
  id: integer("id").primaryKey().default(1),
  companyName: text("company_name").notNull().default(""),
  centerLabel: text("center_label").notNull().default(""),
  address: text("address").notNull().default(""),
  phone: text("phone").notNull().default(""),
  email: text("email").notNull().default(""),
  hours: text("hours").notNull().default(""),
  mapDirectionsUrl: text("map_directions_url").notNull().default(""),
  mapEmbedUrl: text("map_embed_url").notNull().default(""),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .default(sql`now()`),
});

export type SiteContact = typeof siteContact.$inferSelect;
export type NewSiteContact = typeof siteContact.$inferInsert;
