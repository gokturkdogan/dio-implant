import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const adminSettings = pgTable("admin_settings", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .default(sql`now()`),
});

export type AdminSetting = typeof adminSettings.$inferSelect;
export type NewAdminSetting = typeof adminSettings.$inferInsert;

