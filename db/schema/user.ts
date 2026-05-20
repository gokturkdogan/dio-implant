import { sql } from "drizzle-orm";
import { pgEnum, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

/** Panel kullanıcı rolleri: `admin`, `super_admin` (Super Admin). */
export const userRoleEnum = pgEnum("user_role", ["admin", "super_admin"]);

/**
 * Panel / uygulama kullanıcıları.
 * Şifre düz metin değil; bcrypt hash olarak `password_hash` sütununda tutulur.
 */
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: userRoleEnum("role").notNull().default("admin"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .default(sql`now()`),
});

export type UserRole = (typeof userRoleEnum.enumValues)[number];
export type UserRow = typeof users.$inferSelect;
export type NewUserRow = typeof users.$inferInsert;
