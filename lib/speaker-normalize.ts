import type { Speaker } from "./training-events-types";

type LegacySpeaker = {
  name?: string;
  title?: string;
  university?: string;
  specialty?: string;
  bio?: string;
  photoUrl?: string;
  education?: string[];
  specialties?: string[];
  instructorId?: unknown;
};

function parseInstructorId(v: unknown): number | undefined {
  if (typeof v === "number" && Number.isFinite(v) && v > 0) return Math.floor(v);
  if (typeof v === "bigint") {
    const n = Number(v);
    return n > 0 && Number.isFinite(n) ? n : undefined;
  }
  if (typeof v === "string" && /^\d+$/.test(v.trim())) {
    const n = parseInt(v, 10);
    return n > 0 ? n : undefined;
  }
  return undefined;
}

export function normalizeSpeaker(raw: unknown): Speaker {
  if (!raw || typeof raw !== "object") {
    return { name: "", education: [], specialties: [], bio: "" };
  }
  const o = raw as LegacySpeaker;
  const instructorId = parseInstructorId(o.instructorId);
  if (Array.isArray(o.education) && Array.isArray(o.specialties)) {
    return {
      name: String(o.name ?? "").trim(),
      photoUrl:
        typeof o.photoUrl === "string" && o.photoUrl.trim()
          ? o.photoUrl.trim()
          : undefined,
      education: o.education
        .filter((x): x is string => typeof x === "string" && x.trim().length > 0)
        .map((x) => x.trim()),
      specialties: o.specialties
        .filter((x): x is string => typeof x === "string" && x.trim().length > 0)
        .map((x) => x.trim()),
      bio: String(o.bio ?? "").trim(),
      ...(instructorId ? { instructorId } : {}),
    };
  }
  const education: string[] = [];
  if (o.title?.trim()) education.push(o.title.trim());
  if (o.university?.trim()) education.push(o.university.trim());
  return {
    name: String(o.name ?? "").trim(),
    photoUrl:
      typeof o.photoUrl === "string" && o.photoUrl.trim()
        ? o.photoUrl.trim()
        : undefined,
    education,
    specialties: o.specialty?.trim() ? [o.specialty.trim()] : [],
    bio: String(o.bio ?? "").trim(),
    ...(instructorId ? { instructorId } : {}),
  };
}

export function normalizeSpeakers(list: unknown): Speaker[] {
  if (!Array.isArray(list)) return [];
  return list.map(normalizeSpeaker);
}
