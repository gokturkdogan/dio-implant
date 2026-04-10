/**
 * Eğitim takvimi — `seminars` PostgreSQL tablosundan okunur.
 */

import { seminarService } from "../services/seminar.service";

export type {
  CurriculumItem,
  Speaker,
  TrainingEvent,
  TrainingFormat,
} from "./training-events-types";

/** Liste kartlarında varsayılan kapak görseli */
export const ACADEMY_EVENT_GRID_COVER_URL =
  "https://www.dioimplant.com/file/images/dd665ea6-868b-46ba-b4f9-5a1b4730a469";

export async function getTrainingEventsSorted() {
  return seminarService.listAll();
}

export async function getTrainingBySlug(slug: string) {
  return seminarService.getBySlug(slug);
}

const TR_MONTHS_SHORT = [
  "Oca", "Şub", "Mar", "Nis", "May", "Haz",
  "Tem", "Ağu", "Eyl", "Eki", "Kas", "Ara",
] as const;

export function getTrainingCardDateParts(dateISO: string): {
  day: number;
  monthShort: string;
} {
  const [, m, d] = dateISO.split("-").map(Number);
  const day = Number.isFinite(d) ? d : 1;
  const monthIdx = Number.isFinite(m) ? m - 1 : 0;
  return {
    day,
    monthShort: TR_MONTHS_SHORT[monthIdx] ?? "—",
  };
}
