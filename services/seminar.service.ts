import "server-only";
import { eq } from "drizzle-orm";
import { seminars, type NewSeminarRow, type SeminarRow } from "../db/schema";
import { db } from "../lib/drizzle";
import type { TrainingEvent } from "../lib/training-events-types";
import { normalizeSpeakers } from "../lib/speaker-normalize";

function rowToEvent(r: SeminarRow): TrainingEvent {
  return {
    slug: r.slug,
    title: r.title,
    coverUrl: r.coverUrl ?? undefined,
    posterUrl: r.posterUrl ?? undefined,
    dateISO: r.dateIso,
    slotStart: r.slotStart,
    slotEnd: r.slotEnd,
    dateDisplay: r.dateDisplay,
    timeRange: r.timeRange ?? undefined,
    city: r.city,
    venue: r.venue,
    venueAddress: r.venueAddress ?? undefined,
    format: r.format,
    instructors: r.instructors ?? [],
    excerpt: r.excerpt,
    highlights: r.highlights ?? undefined,
    speakers: r.speakers ? normalizeSpeakers(r.speakers) : undefined,
    curriculum: r.curriculum ?? undefined,
  };
}

function eventToInsert(ev: TrainingEvent): NewSeminarRow {
  return {
    slug: ev.slug,
    title: ev.title,
    coverUrl: ev.coverUrl ?? null,
    posterUrl: ev.posterUrl ?? null,
    dateIso: ev.dateISO,
    slotStart: ev.slotStart,
    slotEnd: ev.slotEnd,
    dateDisplay: ev.dateDisplay,
    timeRange: ev.timeRange ?? null,
    city: ev.city,
    venue: ev.venue,
    venueAddress: ev.venueAddress ?? null,
    format: ev.format,
    instructors: ev.instructors,
    excerpt: ev.excerpt,
    highlights: ev.highlights ?? null,
    speakers: ev.speakers ?? null,
    curriculum: ev.curriculum ?? null,
  };
}

export const seminarService = {
  async listAll(): Promise<TrainingEvent[]> {
    const rows = await db.query.seminars.findMany({
      orderBy: (t, { desc }) => [desc(t.dateIso)],
    });
    return rows.map(rowToEvent);
  },

  async getBySlug(slug: string): Promise<TrainingEvent | undefined> {
    const row = await db.query.seminars.findFirst({
      where: eq(seminars.slug, slug),
    });
    return row ? rowToEvent(row) : undefined;
  },

  async getAllSlugs(): Promise<string[]> {
    const rows = await db
      .select({ slug: seminars.slug })
      .from(seminars);
    return rows.map((r) => r.slug);
  },

  async slugExists(slug: string, excludeSlug?: string): Promise<boolean> {
    const row = await db.query.seminars.findFirst({
      where: eq(seminars.slug, slug),
      columns: { slug: true },
    });
    if (!row) return false;
    return excludeSlug ? row.slug !== excludeSlug : true;
  },

  async create(ev: TrainingEvent): Promise<TrainingEvent> {
    const [row] = await db
      .insert(seminars)
      .values(eventToInsert(ev))
      .returning();
    return rowToEvent(row);
  },

  async update(originalSlug: string, ev: TrainingEvent): Promise<TrainingEvent> {
    const vals = eventToInsert(ev);
    const [row] = await db
      .update(seminars)
      .set({ ...vals, updatedAt: new Date() })
      .where(eq(seminars.slug, originalSlug))
      .returning();
    if (!row) throw new Error("Etkinlik bulunamadı");
    return rowToEvent(row);
  },

  async deleteBySlug(slug: string): Promise<boolean> {
    const result = await db
      .delete(seminars)
      .where(eq(seminars.slug, slug))
      .returning({ slug: seminars.slug });
    return result.length > 0;
  },
};
