import { z } from "zod";

const optionalHttpsUrl = z.preprocess(
  (v) => {
    if (v == null || v === "") return undefined;
    const t = String(v).trim();
    return t === "" ? undefined : t;
  },
  z.string().url().optional(),
);

const speakerSchema = z.object({
  name: z.string().min(1),
  photoUrl: optionalHttpsUrl,
  education: z.array(z.string().min(1)).default([]),
  specialties: z.array(z.string().min(1)).default([]),
  bio: z.string(),
});

const curriculumItemSchema = z.object({
  time: z.string(),
  topic: z.string(),
  speaker: z.string().optional(),
});

export const trainingEventSchema = z.object({
  slug: z
    .string()
    .min(1)
    .max(200)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  title: z.string().min(1),
  coverUrl: optionalHttpsUrl,
  posterUrl: optionalHttpsUrl,
  dateISO: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  slotStart: z.string().min(1),
  slotEnd: z.string().min(1),
  dateDisplay: z.string().min(1),
  timeRange: z.preprocess(
    (v) => (v === "" || v == null ? undefined : v),
    z.string().optional(),
  ),
  city: z.string().min(1),
  venue: z.string().min(1),
  venueAddress: z.preprocess(
    (v) => {
      if (v == null || v === "") return undefined;
      const t = String(v).trim();
      return t === "" ? undefined : t;
    },
    z.string().min(1).optional(),
  ),
  format: z.enum(["Hands-on", "Seminer", "Teorik + Uygulama"]),
  instructors: z.array(z.string().min(1)).default([]),
  excerpt: z.string(),
  highlights: z.array(z.string()).optional(),
  speakers: z.array(speakerSchema).optional(),
  curriculum: z.array(curriculumItemSchema).optional(),
});

export type TrainingEventPayload = z.infer<typeof trainingEventSchema>;
