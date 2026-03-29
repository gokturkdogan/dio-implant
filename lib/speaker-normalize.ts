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
};

export function normalizeSpeaker(raw: unknown): Speaker {
  if (!raw || typeof raw !== "object") {
    return { name: "", education: [], specialties: [], bio: "" };
  }
  const o = raw as LegacySpeaker;
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
  };
}

export function normalizeSpeakers(list: unknown): Speaker[] {
  if (!Array.isArray(list)) return [];
  return list.map(normalizeSpeaker);
}
