import {
  integer,
  pgTable,
  serial,
  timestamp,
} from "drizzle-orm/pg-core";
import { instructors } from "./instructor";
import { seminars } from "./seminars";

/**
 * Etkinlik ↔ eğitmen (konuşmacı) çoktan çoğa ilişki. Konuşmacı verisi yalnızca `instructors` tablosundan okunur.
 */
export const seminarSpeakers = pgTable("seminar_speakers", {
  id: serial("id").primaryKey(),
  seminarId: integer("seminar_id")
    .notNull()
    .references(() => seminars.id, { onDelete: "cascade" }),
  instructorId: integer("instructor_id")
    .notNull()
    .references(() => instructors.id, { onDelete: "restrict" }),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type SeminarSpeakerRow = typeof seminarSpeakers.$inferSelect;
export type NewSeminarSpeakerRow = typeof seminarSpeakers.$inferInsert;
