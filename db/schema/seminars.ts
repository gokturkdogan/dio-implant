import { sql } from "drizzle-orm";
import {
  date,
  jsonb,
  pgEnum,
  pgTable,
  serial,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import type { CurriculumItem } from "@/lib/training-events-types";

/** Eğitim / seminer formatı — uygulama `TrainingFormat` ile aynı değerler */
export const seminarFormatEnum = pgEnum("seminar_format", [
  "Hands-on",
  "Seminer",
  "Teorik + Uygulama",
]);

/**
 * Akademi eğitimleri (admin formundaki tüm alanlar).
 * Konuşmacılar `seminar_speakers` tablosunda; `curriculum` JSONB.
 */
export const seminars = pgTable("seminars", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  coverUrl: text("cover_url"),
  posterUrl: text("poster_url"),
  dateIso: date("date_iso", { mode: "string" }).notNull(),
  slotStart: text("slot_start").notNull(),
  slotEnd: text("slot_end").notNull(),
  dateDisplay: text("date_display").notNull(),
  timeRange: text("time_range"),
  city: text("city").notNull(),
  venue: text("venue").notNull(),
  venueAddress: text("venue_address"),
  format: seminarFormatEnum("format").notNull(),
  instructors: jsonb("instructors")
    .$type<string[]>()
    .notNull()
    .default(sql`'[]'::jsonb`),
  excerpt: text("excerpt").notNull(),
  highlights: jsonb("highlights").$type<string[]>(),
  curriculum: jsonb("curriculum").$type<CurriculumItem[]>(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .default(sql`now()`),
});

export type SeminarRow = typeof seminars.$inferSelect;
export type NewSeminarRow = typeof seminars.$inferInsert;
