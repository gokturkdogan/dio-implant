import "server-only";
import { asc, eq, inArray } from "drizzle-orm";
import {
  type InstructorRow,
  instructors,
  type NewSeminarRow,
  seminarSpeakers,
  seminars,
  type SeminarRow,
} from "../db/schema";
import { db } from "../lib/drizzle";
import { instructorToSpeaker } from "../lib/instructor-types";
import type { InstructorRecord } from "../lib/instructor-types";
import type { Speaker, TrainingEvent } from "../lib/training-events-types";

function instructorRowToSpeaker(r: InstructorRow): Speaker {
  const rec: InstructorRecord = {
    id: r.id,
    name: r.name,
    photoUrl: r.photoUrl ?? undefined,
    education: r.education ?? [],
    specialties: r.specialties ?? [],
    bio: r.bio,
    createdAt: r.createdAt.toISOString(),
    updatedAt: r.updatedAt.toISOString(),
  };
  return { ...instructorToSpeaker(rec), instructorId: r.id };
}

/** Drizzle join sonucu: `instructors` satırı */
type INull = InstructorRow | null;

function mapSeminarSpeakersToTrainingImpl(
  rows: Array<{ instructor: INull }>,
): Speaker[] {
  const out: Speaker[] = [];
  for (const link of rows) {
    if (!link.instructor) continue;
    out.push(instructorRowToSpeaker(link.instructor));
  }
  return out;
}

function rowToEventRowOnly(r: SeminarRow): Omit<TrainingEvent, "speakers"> {
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
    curriculum: r.curriculum ?? undefined,
  };
}

function assembleEvent(
  r: SeminarRow,
  speakerLinks: Array<{ instructor: INull }>,
): TrainingEvent {
  const speakers = mapSeminarSpeakersToTrainingImpl(speakerLinks);
  return {
    ...rowToEventRowOnly(r),
    speakers: speakers.length ? speakers : undefined,
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
    curriculum: ev.curriculum ?? null,
  };
}

function assertSpeakersLinkable(speakers: TrainingEvent["speakers"]): void {
  if (!speakers?.length) return;
  for (const s of speakers) {
    const id = s.instructorId;
    if (typeof id !== "number" || !Number.isFinite(id) || id < 1) {
      throw new Error(
        "Her konuşmacı eğitmen kütüphanesinden seçilmelidir (Eğitmenler sayfası).",
      );
    }
  }
}

/**
 * `seminar_speakers` + `instructors` — konuşmacı metni her zaman instructors tablosundan.
 */
async function speakerLinksForSeminarIds(
  seminarIds: number[],
): Promise<Map<number, Array<{ instructor: INull }>>> {
  const map = new Map<number, Array<{ instructor: INull }>>();
  if (seminarIds.length === 0) return map;

  const links = await db
    .select()
    .from(seminarSpeakers)
    .where(inArray(seminarSpeakers.seminarId, seminarIds))
    .orderBy(asc(seminarSpeakers.seminarId), asc(seminarSpeakers.sortOrder));

  const instructorIds = [...new Set(links.map((l) => l.instructorId))];
  const instRows =
    instructorIds.length > 0
      ? await db.query.instructors.findMany({
          where: inArray(instructors.id, instructorIds),
        })
      : [];
  const byInstructorId = new Map(instRows.map((i) => [i.id, i]));

  for (const l of links) {
    const inst = byInstructorId.get(l.instructorId) ?? null;
    const arr = map.get(l.seminarId) ?? [];
    arr.push({ instructor: inst });
    map.set(l.seminarId, arr);
  }
  return map;
}

export const seminarService = {
  async listAll(): Promise<TrainingEvent[]> {
    const rows = await db.query.seminars.findMany({
      orderBy: (t, { desc: d }) => [d(t.dateIso)],
    });
    const ids = rows.map((r) => r.id);
    const linksBy = await speakerLinksForSeminarIds(ids);
    return rows.map((r) => assembleEvent(r, linksBy.get(r.id) ?? []));
  },

  async getBySlug(slug: string): Promise<TrainingEvent | undefined> {
    const row = await db.query.seminars.findFirst({
      where: eq(seminars.slug, slug),
    });
    if (!row) return undefined;
    const linksBy = await speakerLinksForSeminarIds([row.id]);
    return assembleEvent(row, linksBy.get(row.id) ?? []);
  },

  async getAllSlugs(): Promise<string[]> {
    const rows = await db.select({ slug: seminars.slug }).from(seminars);
    return rows.map((r) => r.slug);
  },

  async slugExists(slug: string, excludeSlug?: string): Promise<boolean> {
    const found = await db.query.seminars.findFirst({
      where: eq(seminars.slug, slug),
      columns: { slug: true },
    });
    if (!found) return false;
    return excludeSlug ? found.slug !== excludeSlug : true;
  },

  async create(ev: TrainingEvent): Promise<TrainingEvent> {
    assertSpeakersLinkable(ev.speakers);
    const inserted = await db.transaction(async (tx) => {
      const [r] = await tx.insert(seminars).values(eventToInsert(ev)).returning();
      if (!r) throw new Error("Etkinlik oluşturulamadı");
      if (ev.speakers?.length) {
        await tx.insert(seminarSpeakers).values(
          ev.speakers.map((s, i) => ({
            seminarId: r.id,
            instructorId: s.instructorId!,
            sortOrder: i,
          })),
        );
      }
      return r;
    });
    const out = await seminarService.getBySlug(inserted.slug);
    if (!out) throw new Error("Etkinlik okunamadı");
    return out;
  },

  async update(originalSlug: string, ev: TrainingEvent): Promise<TrainingEvent> {
    assertSpeakersLinkable(ev.speakers);
    const updatedRow = await db.transaction(async (tx) => {
      const [r] = await tx
        .update(seminars)
        .set({ ...eventToInsert(ev), updatedAt: new Date() })
        .where(eq(seminars.slug, originalSlug))
        .returning();
      if (!r) throw new Error("Etkinlik bulunamadı");

      await tx.delete(seminarSpeakers).where(eq(seminarSpeakers.seminarId, r.id));
      if (ev.speakers?.length) {
        await tx.insert(seminarSpeakers).values(
          ev.speakers.map((s, i) => ({
            seminarId: r.id,
            instructorId: s.instructorId!,
            sortOrder: i,
          })),
        );
      }
      return r;
    });
    const out = await seminarService.getBySlug(updatedRow.slug);
    if (!out) throw new Error("Etkinlik okunamadı");
    return out;
  },

  async deleteBySlug(slug: string): Promise<boolean> {
    const result = await db
      .delete(seminars)
      .where(eq(seminars.slug, slug))
      .returning({ slug: seminars.slug });
    return result.length > 0;
  },
};
