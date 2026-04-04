import { integer, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const authorizedDealers = pgTable("authorized_dealers", {
  id: serial("id").primaryKey(),
  sortOrder: integer("sort_order").notNull().default(0),
  name: text("name").notNull(),
  serviceRegion: text("service_region").notNull(),
  contactPerson: text("contact_person"),
  phone: text("phone").notNull(),
  website: text("website"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .default(sql`now()`),
});

export type AuthorizedDealer = typeof authorizedDealers.$inferSelect;
export type NewAuthorizedDealer = typeof authorizedDealers.$inferInsert;
