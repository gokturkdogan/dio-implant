import { pgTable, serial, text, boolean, timestamp } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const sitePopups = pgTable("site_popups", {
  id: serial("id").primaryKey(),
  key: text("key").notNull().unique(),
  enabled: boolean("enabled").notNull().default(false),
  imageUrl: text("image_url").notNull(),
  linkUrl: text("link_url"),
  openInNewTab: boolean("open_in_new_tab").notNull().default(false),
  startAt: timestamp("start_at", { withTimezone: true }),
  endAt: timestamp("end_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .default(sql`now()`),
});

export type SitePopup = typeof sitePopups.$inferSelect;
export type NewSitePopup = typeof sitePopups.$inferInsert;

