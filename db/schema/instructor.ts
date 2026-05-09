import { sql } from "drizzle-orm";
import { jsonb, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

/**
 * Akademi eğitmenleri — konuşmacı alanıyla aynı veri modeli; görseller Cloudinary `Instructors/{id}` altında.
 */
export const instructors = pgTable("instructors", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  photoUrl: text("photo_url"),
  education: jsonb("education")
    .$type<string[]>()
    .notNull()
    .default(sql`'[]'::jsonb`),
  specialties: jsonb("specialties")
    .$type<string[]>()
    .notNull()
    .default(sql`'[]'::jsonb`),
  bio: text("bio").notNull().default(""),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .default(sql`now()`),
});

export type InstructorRow = typeof instructors.$inferSelect;
export type NewInstructorRow = typeof instructors.$inferInsert;
