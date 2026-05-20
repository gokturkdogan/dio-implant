import { sql } from "drizzle-orm";
import { integer, jsonb, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { users } from "./user";

/** Yönetim paneli işlem günlüğü (süper yönetici görüntüler). */
export const adminAuditLogs = pgTable("admin_audit_logs", {
  id: serial("id").primaryKey(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .default(sql`now()`),
  userId: integer("user_id").references(() => users.id, { onDelete: "set null" }),
  username: text("username").notNull(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  email: text("email").notNull(),
  /** create | update | delete | reorder | upload | invite | profile_update | password_update */
  action: text("action").notNull(),
  /** category, product, training, … */
  resourceType: text("resource_type").notNull(),
  resourceId: text("resource_id"),
  resourceLabel: text("resource_label"),
  /** Türkçe özet cümle (tarih/saat + kullanıcı + işlem) */
  summary: text("summary").notNull(),
  /** Panelde ilgili kaynağa giden yol */
  adminPath: text("admin_path"),
  metadata: jsonb("metadata").$type<Record<string, unknown> | null>(),
});

export type AdminAuditLogRow = typeof adminAuditLogs.$inferSelect;
