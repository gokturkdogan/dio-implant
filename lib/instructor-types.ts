import type { Speaker } from "@/lib/training-events-types";

export type InstructorRecord = {
  id: number;
  name: string;
  photoUrl?: string;
  education: string[];
  specialties: string[];
  bio: string;
  createdAt: string;
  updatedAt: string;
};

export function instructorToSpeaker(record: InstructorRecord): Speaker {
  return {
    name: record.name,
    photoUrl: record.photoUrl,
    education: [...record.education],
    specialties: [...record.specialties],
    bio: record.bio,
  };
}
